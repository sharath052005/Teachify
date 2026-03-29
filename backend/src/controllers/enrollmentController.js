const pool = require('../config/db')

// POST request enrollment
const requestEnrollment = async (req, res) => {
  try {
    const buyerId  = req.user.id
    const courseId = req.params.courseId

    // Check course exists and is published
    const [courses] = await pool.query(
      "SELECT id, seller_id, title FROM courses WHERE id = ? AND status = 'published'",
      [courseId]
    )

    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' })
    }

    if (courses[0].seller_id === buyerId) {
      return res.status(400).json({ success: false, message: 'You cannot enroll in your own course.' })
    }

    // Check existing enrollment
    const [existing] = await pool.query(
      'SELECT id, status FROM enrollments WHERE buyer_id = ? AND course_id = ?',
      [buyerId, courseId]
    )

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: existing[0].status === 'approved'
          ? 'You are already enrolled.'
          : `Request already ${existing[0].status}.`
      })
    }

    await pool.query(
      'INSERT INTO enrollments (buyer_id, course_id, status) VALUES (?, ?, ?)',
      [buyerId, courseId, 'pending']
    )

    return res.status(201).json({ success: true, message: 'Access request sent!' })
  } catch (err) {
    console.error('Request enrollment error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// GET buyer's enrollments
const getMyEnrollments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*,
        c.title as title,
        c.thumbnail_url,
        c.category,
        c.level,
        c.total_lessons,
        u.name as seller_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON c.seller_id = u.id
       WHERE e.buyer_id = ?
       ORDER BY e.requested_at DESC`,
      [req.user.id]
    )
    return res.status(200).json({ success: true, enrollments: rows })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// GET check enrollment for a specific course
const checkEnrollment = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, status FROM enrollments WHERE buyer_id = ? AND course_id = ?',
      [req.user.id, req.params.courseId]
    )
    return res.status(200).json({
      success: true,
      enrollment: rows[0] || null,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// GET seller's requests
const getSellerRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*,
        u.name as buyer_name,
        u.email as buyer_email,
        c.title as course_title,
        c.thumbnail_url
       FROM enrollments e
       JOIN users u ON e.buyer_id = u.id
       JOIN courses c ON e.course_id = c.id
       WHERE c.seller_id = ?
       ORDER BY e.requested_at DESC`,
      [req.user.id]
    )
    return res.status(200).json({ success: true, requests: rows })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// PUT respond to enrollment request
const respondEnrollment = async (req, res) => {
  try {
    const { status } = req.body
    const { id }     = req.params

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' })
    }

    // Verify seller owns the course
    const [rows] = await pool.query(
      `SELECT e.id FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.id = ? AND c.seller_id = ?`,
      [id, req.user.id]
    )

    if (rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' })
    }

    await pool.query(
      'UPDATE enrollments SET status = ?, responded_at = NOW() WHERE id = ?',
      [status, id]
    )

    return res.status(200).json({ success: true, message: `Request ${status}.` })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// GET progress for a course
const getProgress = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT lesson_id FROM lesson_progress WHERE buyer_id = ? AND course_id = ? AND completed = 1',
      [req.user.id, req.params.courseId]
    )
    return res.status(200).json({
      success: true,
      completed_lessons: rows.map(r => r.lesson_id)
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// POST mark lesson complete
const markLesson = async (req, res) => {
  try {
    const { lessonId } = req.params
    const { completed } = req.body

    // Get course_id from lesson
    const [lessons] = await pool.query('SELECT course_id FROM lessons WHERE id = ?', [lessonId])
    if (lessons.length === 0) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' })
    }

    const courseId = lessons[0].course_id

    await pool.query(
      `INSERT INTO lesson_progress (buyer_id, lesson_id, course_id, completed)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE completed = ?`,
      [req.user.id, lessonId, courseId, completed, completed]
    )

    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

module.exports = {
  requestEnrollment,
  getMyEnrollments,
  checkEnrollment,
  getSellerRequests,
  respondEnrollment,
  getProgress,
  markLesson,
}