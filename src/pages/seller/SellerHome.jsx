import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyCoursesAPI } from '../../api/courses'
import { getSellerRequestsAPI } from '../../api/enrollments'
import '../../styles/sellerhome.css'

export default function SellerHome() {
  const { user }            = useAuth()
  const [courses, setCourses] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      getMyCoursesAPI().catch(() => ({ courses: [] })),
      getSellerRequestsAPI().catch(() => ({ requests: [] })),
    ]).then(([cData, rData]) => {
      setCourses(cData.courses || [])
      setRequests(rData.requests || [])
    }).finally(() => setLoading(false))
  }, [])

  const published   = courses.filter(c => c.status === 'published')
  const drafts      = courses.filter(c => c.status === 'draft')
  const pending     = requests.filter(r => r.status === 'pending')
  const approved    = requests.filter(r => r.status === 'approved')
  const totalStudents = approved.length

  return (
    <div className="seller-home page-enter">

      {/* Hero */}
      <div className="seller-hero">
        <div className="seller-hero__bg" />
        <div className="container seller-hero__content">
          <div>
            <div className="seller-hero__badge">🎓 Instructor Dashboard</div>
            <h1>
              Welcome, <span className="seller-hero__name">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p>Manage your courses, review access requests, and grow your student base.</p>
            <div className="seller-hero__actions">
              <Link to="/seller/courses/create" className="btn btn-primary seller-hero__btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Create New Course
              </Link>
              <Link to="/seller/requests" className="btn seller-hero__outline">
                View Requests {pending.length > 0 && `(${pending.length} new)`}
              </Link>
            </div>
          </div>

          {/* Quick stat card */}
          <div className="seller-hero__card">
            <p className="seller-hero__card-label">Total Students</p>
            <strong className="seller-hero__card-num">{totalStudents}</strong>
            <div className="seller-hero__card-divider" />
            <div className="seller-hero__card-row">
              <div>
                <strong>{published.length}</strong>
                <span>Published</span>
              </div>
              <div>
                <strong>{pending.length}</strong>
                <span>Pending</span>
              </div>
              <div>
                <strong>{drafts.length}</strong>
                <span>Drafts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container seller-body">

        {/* Stats */}
        <div className="seller-stats">
          {[
            { icon: '📚', label: 'Total Courses', value: courses.length, color: '#7c3aed', bg: '#f5f3ff' },
            { icon: '🟢', label: 'Published', value: published.length, color: '#059669', bg: '#ecfdf5' },
            { icon: '👥', label: 'Total Students', value: totalStudents, color: '#0891b2', bg: '#ecfeff' },
            { icon: '⏳', label: 'Pending Requests', value: pending.length, color: '#d97706', bg: '#fffbeb' },
          ].map(s => (
            <div key={s.label} className="seller-stat" style={{ '--sc': s.color, '--sb': s.bg }}>
              <div className="seller-stat__icon">{s.icon}</div>
              <div>
                <strong>{s.value}</strong>
                <p>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="seller-grid">

          {/* My Courses */}
          <div className="seller-card">
            <div className="seller-card__header">
              <h2>My Courses</h2>
              <Link to="/seller/courses" className="seller-card__link">View all</Link>
            </div>

            {loading ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : courses.length === 0 ? (
              <div className="seller-empty">
                <p>📭</p>
                <h3>No courses yet</h3>
                <p>Create your first course to start teaching</p>
                <Link to="/seller/courses/create" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Create Course
                </Link>
              </div>
            ) : (
              <div className="seller-course-list">
                {courses.slice(0, 4).map(course => (
                  <div key={course.id} className="seller-course-row">
                    <div className="seller-course-thumb">
                      {course.thumbnail_url
                        ? <img src={course.thumbnail_url} alt={course.title} />
                        : <span>🎓</span>
                      }
                    </div>
                    <div className="seller-course-info">
                      <strong>{course.title}</strong>
                      <span>{course.category} · {course.level}</span>
                    </div>
                    <div className="seller-course-meta">
                      <span
                        className="seller-course-status"
                        style={course.status === 'published'
                          ? { background: '#ecfdf5', color: '#059669' }
                          : { background: '#fef9c3', color: '#ca8a04' }
                        }
                      >
                        {course.status === 'published' ? '🟢 Live' : '📝 Draft'}
                      </span>
                      <span className="seller-course-students">
                        {course.student_count || 0} students
                      </span>
                    </div>
                    <Link
                      to={`/seller/courses/${course.id}/edit`}
                      className="btn btn-ghost seller-edit-btn"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <Link to="/seller/courses" className="seller-card__footer">
              Manage all courses →
            </Link>
          </div>

          {/* Pending Requests */}
          <div className="seller-card">
            <div className="seller-card__header">
              <h2>
                Access Requests
                {pending.length > 0 && (
                  <span className="seller-badge-count">{pending.length}</span>
                )}
              </h2>
              <Link to="/seller/requests" className="seller-card__link">View all</Link>
            </div>

            {loading ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : pending.length === 0 ? (
              <div className="seller-empty">
                <p>✅</p>
                <h3>All caught up!</h3>
                <p>No pending access requests</p>
              </div>
            ) : (
              <div className="seller-request-list">
                {pending.slice(0, 5).map(req => (
                  <div key={req.id} className="seller-request-row">
                    <div className="seller-request-avatar">
                      {req.buyer_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="seller-request-info">
                      <strong>{req.buyer_name}</strong>
                      <span>{req.course_title}</span>
                    </div>
                    <Link
                      to="/seller/requests"
                      className="btn btn-outline"
                      style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: '20px' }}
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <Link to="/seller/requests" className="seller-card__footer">
              View all requests →
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="seller-quick">
          <h2>Quick Actions</h2>
          <div className="seller-quick-grid">
            {[
              { icon: '➕', title: 'Create Course', desc: 'Start building your next course', link: '/seller/courses/create', primary: true },
              { icon: '📋', title: 'Review Requests', desc: `${pending.length} requests waiting`, link: '/seller/requests', primary: false },
              { icon: '📚', title: 'Manage Courses', desc: 'Edit and update your courses', link: '/seller/courses', primary: false },
              { icon: '🏢', title: 'Instructor Profile', desc: 'Update your public profile', link: '/profile', primary: false },
            ].map(a => (
              <Link
                key={a.title}
                to={a.link}
                className={`seller-quick-card ${a.primary ? 'primary' : ''}`}
              >
                <span>{a.icon}</span>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
                <span className="seller-quick-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}