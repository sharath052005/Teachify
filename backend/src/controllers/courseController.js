const pool = require('../config/db')
const { uploadThumbnail } = require('../config/cloudinary')

// GET all published courses
const getCourses = async (req, res) => {
  try {
    const { q, category, level, limit } = req.query
    let sql = `
      SELECT c.*,
        u.name as seller_name,
        u.avatar as seller_avatar,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'approved') as student_count,
        (SELECT AVG(r.rating) FROM reviews r WHERE r.course_id = c.id) as rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.course_id = c.id) as review_count
      FROM courses c
      JOIN users u ON c.seller_id = u.id
      WHERE c.status = 'published'
    `
    const params = []

    if (q)        { sql += ' AND (c.title LIKE ? OR c.subtitle LIKE ?)'; params.push(`%${q}%`, `%${q}%`) }
    if (category) { sql += ' AND c.category = ?'; params.push(category) }
    if (level)    { sql += ' AND c.level = ?';    params.push(level) }

    sql += ' ORDER BY c.created_at DESC'

    if (limit) { sql += ' LIMIT ?'; params.push(Number(limit)) }

    const [rows] = await pool.query(sql, params)

    const courses = rows.map(c => ({
      ...c,
      rating: Number(c.rating || 0).toFixed(1),
      price:  Number(c.price),
    }))

    return res.status(200).json({ success: true, courses })
  } catch (err) {
    console.error('Get courses error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// GET single course with sections and lessons
const getCourse = async (req, res) => {
  try {
    const { id } = req.params

    const [courses] = await pool.query(
      `SELECT c.*, u.name as seller_name, u.avatar as seller_avatar, u.bio as seller_bio,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'approved') as student_count,
        (SELECT AVG(r.rating) FROM reviews r WHERE r.course_id = c.id) as rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.course_id = c.id) as review_count
       FROM courses c
       JOIN users u ON c.seller_id = u.id
       WHERE c.id = ?`,
      [id]
    )

    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' })
    }

    const course = courses[0]

    // Get sections
    const [sections] = await pool.query(
      'SELECT * FROM sections WHERE course_id = ? ORDER BY order_num ASC',
      [id]
    )

    // Get lessons for each section
    for (const section of sections) {
      const [lessons] = await pool.query(
        'SELECT * FROM lessons WHERE section_id = ? ORDER BY order_num ASC',
        [section.id]
      )
      section.lessons = lessons
    }

    course.sections = sections
    course.price    = Number(course.price)
    course.rating   = Number(course.rating || 0).toFixed(1)

    return res.status(200).json({ success: true, course })
  } catch (err) {
    console.error('Get course error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// GET seller's own courses
const getMyCourses = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'approved') as student_count,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'pending') as pending_count
       FROM courses c
       WHERE c.seller_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    )
    return res.status(200).json({ success: true, courses: rows })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// POST create course
const createCourse = async (req, res) => {
  try {
    const {
      title, subtitle, description, category, level, language,
      price, youtube_id, what_you_learn, requirements
    } = req.body

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required.' })
    }

    // Auto-generate thumbnail from YouTube ID if provided
const thumbnail_url = youtube_id
  ? `https://img.youtube.com/vi/${youtube_id}/hqdefault.jpg`
  : null

const [result] = await pool.query(
  `INSERT INTO courses
    (seller_id, title, subtitle, description, category, level, language,
     price, youtube_id, thumbnail_url, what_you_learn, requirements, status)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
  [
    req.user.id, title, subtitle, description, category,
    level || 'Beginner', language || 'English',
    Number(price) || 0,
    youtube_id, thumbnail_url, what_you_learn, requirements
  ]
)

return res.status(201).json({ success: true, course_id: result.insertId })
  } catch (err) {
    console.error('Create course error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// PUT update course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title, subtitle, description, category, level, language,
      price, youtube_id, what_you_learn, requirements
    } = req.body

    // Auto-update thumbnail when youtube_id changes
const thumbnail_url = youtube_id
  ? `https://img.youtube.com/vi/${youtube_id}/hqdefault.jpg`
  : null

await pool.query(
  `UPDATE courses SET
    title = ?, subtitle = ?, description = ?, category = ?, level = ?,
    language = ?, price = ?, youtube_id = ?,
    thumbnail_url = COALESCE(?, thumbnail_url),
    what_you_learn = ?, requirements = ?
   WHERE id = ? AND seller_id = ?`,
  [
    title, subtitle, description, category, level, language,
    Number(price) || 0, youtube_id,
    thumbnail_url,
    what_you_learn, requirements,
    id, req.user.id
  ]
)

return res.status(200).json({ success: true, message: 'Course updated.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// PUT publish course
const publishCourse = async (req, res) => {
  try {
    await pool.query(
      "UPDATE courses SET status = 'published' WHERE id = ? AND seller_id = ?",
      [req.params.id, req.user.id]
    )
    return res.status(200).json({ success: true, message: 'Course published.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// DELETE course
const deleteCourse = async (req, res) => {
  try {
    await pool.query('DELETE FROM courses WHERE id = ? AND seller_id = ?', [req.params.id, req.user.id])
    return res.status(200).json({ success: true, message: 'Course deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// POST add section
const addSection = async (req, res) => {
  try {
    const { title } = req.body
    const { courseId } = req.params

    // Verify ownership
    const [courses] = await pool.query('SELECT id FROM courses WHERE id = ? AND seller_id = ?', [courseId, req.user.id])
    if (courses.length === 0) return res.status(403).json({ success: false, message: 'Access denied.' })

    const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM sections WHERE course_id = ?', [courseId])
    const orderNum = rows[0].cnt

    const [result] = await pool.query(
      'INSERT INTO sections (course_id, title, order_num) VALUES (?, ?, ?)',
      [courseId, title, orderNum]
    )

    return res.status(201).json({ success: true, section_id: result.insertId })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// DELETE section
const deleteSection = async (req, res) => {
  try {
    await pool.query('DELETE FROM sections WHERE id = ?', [req.params.sectionId])
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// POST add lesson
const addLesson = async (req, res) => {
  try {
    const { sectionId } = req.params
    const { title, youtube_id, duration_min, is_preview } = req.body

    if (!title || !youtube_id) {
      return res.status(400).json({ success: false, message: 'Title and YouTube ID required.' })
    }

    // Get course_id from section
    const [sections] = await pool.query('SELECT course_id FROM sections WHERE id = ?', [sectionId])
    if (sections.length === 0) return res.status(404).json({ success: false, message: 'Section not found.' })

    const courseId = sections[0].course_id

    const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM lessons WHERE section_id = ?', [sectionId])
    const orderNum = rows[0].cnt

    const [result] = await pool.query(
      'INSERT INTO lessons (section_id, course_id, title, youtube_id, duration_min, is_preview, order_num) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sectionId, courseId, title, youtube_id, Number(duration_min) || 0, is_preview || false, orderNum]
    )

    // Update total_lessons on course
    await pool.query(
      'UPDATE courses SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = ?) WHERE id = ?',
      [courseId, courseId]
    )

    return res.status(201).json({ success: true, lesson_id: result.insertId })
  } catch (err) {
    console.error('Add lesson error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// DELETE lesson
const deleteLesson = async (req, res) => {
  try {
    await pool.query('DELETE FROM lessons WHERE id = ?', [req.params.lessonId])
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// POST upload thumbnail
const uploadThumbnailHandler = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' })

    const url = req.file.path
    await pool.query('UPDATE courses SET thumbnail_url = ? WHERE id = ? AND seller_id = ?', [url, req.params.id, req.user.id])

    return res.status(200).json({ success: true, thumbnail_url: url })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Upload failed.' })
  }
}

// POST add review
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const { courseId } = req.params

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5.' })
    }

    // Check user is enrolled and approved
    const [enrollments] = await pool.query(
      "SELECT id FROM enrollments WHERE buyer_id = ? AND course_id = ? AND status = 'approved'",
      [req.user.id, courseId]
    )

    if (enrollments.length === 0) {
      return res.status(403).json({ success: false, message: 'You must be enrolled to review.' })
    }

    await pool.query(
      'INSERT INTO reviews (buyer_id, course_id, rating, comment) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?, comment = ?',
      [req.user.id, courseId, rating, comment, rating, comment]
    )

    return res.status(201).json({ success: true, message: 'Review submitted.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

module.exports = {
  getCourses, getCourse, getMyCourses,
  createCourse, updateCourse, publishCourse, deleteCourse,
  addSection, deleteSection,
  addLesson, deleteLesson,
  uploadThumbnailHandler,
  addReview,
}