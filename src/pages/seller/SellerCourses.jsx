import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyCoursesAPI, deleteCourseAPI, publishCourseAPI } from '../../api/courses'
import '../../styles/sellercourses.css'

export default function SellerCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchCourses() }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const data = await getMyCoursesAPI()
      setCourses(data.courses || [])
    } catch { setCourses([]) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return
    setDeleting(id)
    try {
      await deleteCourseAPI(id)
      setCourses(c => c.filter(course => course.id !== id))
      setMsg('Course deleted.')
      setTimeout(() => setMsg(''), 3000)
    } catch { alert('Failed to delete.') }
    finally { setDeleting(null) }
  }

  const handlePublish = async (id) => {
    try {
      await publishCourseAPI(id)
      setCourses(c => c.map(course => course.id === id ? { ...course, status: 'published' } : course))
      setMsg('Course published!')
      setTimeout(() => setMsg(''), 3000)
    } catch { alert('Failed to publish.') }
  }

  const formatPrice = (p) => p === 0 ? 'Free' : `₹${Number(p).toLocaleString('en-IN')}`

  return (
    <div className="seller-courses-page page-enter">
      <div className="container">

        <div className="sc-header">
          <div>
            <h1>My Courses</h1>
            <p>{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/seller/courses/create" className="btn btn-primary">
            + Create Course
          </Link>
        </div>

        {msg && <div className="toast" style={{ marginBottom: 20 }}>{msg}</div>}

        {loading ? (
          <div className="loading-screen" style={{ minHeight: 200 }}>
            <div className="spinner" />
          </div>
        ) : courses.length === 0 ? (
          <div className="sc-empty">
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎓</div>
            <h2>No courses yet</h2>
            <p>Create your first course and start teaching students today.</p>
            <Link to="/seller/courses/create" className="btn btn-primary">Create Your First Course</Link>
          </div>
        ) : (
          <div className="sc-list">
            {courses.map(course => (
              <div key={course.id} className="sc-card">
                <div className="sc-card__thumb">
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt={course.title} />
                    : <span>🎓</span>
                  }
                </div>

                <div className="sc-card__info">
                  <div className="sc-card__top">
                    <h3>{course.title}</h3>
                    <span
                      className="sc-status"
                      style={course.status === 'published'
                        ? { background: '#ecfdf5', color: '#059669' }
                        : { background: '#fef9c3', color: '#ca8a04' }
                      }
                    >
                      {course.status === 'published' ? '🟢 Published' : '📝 Draft'}
                    </span>
                  </div>
                  <p className="sc-card__sub">{course.category} · {course.level}</p>
                  <div className="sc-card__meta">
                    <span>💰 {formatPrice(course.price)}</span>
                    <span>👥 {course.student_count || 0} students</span>
                    {course.total_lessons > 0 && <span>📹 {course.total_lessons} lessons</span>}
                  </div>
                </div>

                <div className="sc-card__actions">
                  <Link
                    to={`/courses/${course.id}`}
                    className="btn btn-ghost sc-action-btn"
                    target="_blank"
                  >
                    👁 Preview
                  </Link>
                  <Link
                    to={`/seller/courses/${course.id}/edit`}
                    className="btn btn-outline sc-action-btn"
                  >
                    ✏️ Edit
                  </Link>
                  {course.status === 'draft' && (
                    <button
                      className="btn btn-primary sc-action-btn"
                      onClick={() => handlePublish(course.id)}
                    >
                      🚀 Publish
                    </button>
                  )}
                  <button
                    className="btn sc-delete-btn"
                    onClick={() => handleDelete(course.id)}
                    disabled={deleting === course.id}
                  >
                    {deleting === course.id ? '...' : '🗑'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}