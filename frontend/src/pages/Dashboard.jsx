import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyEnrollmentsAPI } from '../api/enrollments'
import { DUMMY_COURSES } from '../data/dummy'
import '../styles/dashboard.css'

const STATUS_CONFIG = {
  pending:  { label: 'Pending Review', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  approved: { label: 'Access Granted', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  rejected: { label: 'Not Approved',   color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

export default function Dashboard() {
  const { user }            = useAuth()
  const navigate            = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getMyEnrollmentsAPI()
      .then(data => setEnrollments(data.enrollments || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const approved = enrollments.filter(e => e.status === 'approved')
  const pending  = enrollments.filter(e => e.status === 'pending')

  return (
    <div className="dashboard-page page-enter">
      <div className="container">

        {/* Header */}
        <div className="dash-header">
          <div>
            <h1>My Learning</h1>
            <p>Welcome back, <strong>{user?.name?.split(' ')[0]}</strong>! Continue where you left off.</p>
          </div>
          <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          {[
            { icon: '📚', label: 'Enrolled Courses', value: approved.length, color: '#7c3aed', bg: '#f5f3ff' },
            { icon: '⏳', label: 'Pending Requests', value: pending.length, color: '#d97706', bg: '#fffbeb' },
            { icon: '🏆', label: 'Certificates', value: 0, color: '#059669', bg: '#ecfdf5' },
            { icon: '⏱', label: 'Hours Learned', value: approved.length * 12, color: '#0891b2', bg: '#ecfeff' },
          ].map(s => (
            <div key={s.label} className="dash-stat" style={{ '--sc': s.color, '--sb': s.bg }}>
              <div className="dash-stat__icon">{s.icon}</div>
              <div>
                <strong>{s.value}</strong>
                <p>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: 200 }}>
            <div className="spinner" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty__icon">📚</div>
            <h2>Start your learning journey</h2>
            <p>Browse our catalog and request access to your first course.</p>
            <Link to="/courses" className="btn btn-primary">Explore Courses</Link>
          </div>
        ) : (
          <>
            {/* Enrolled */}
            {approved.length > 0 && (
              <div className="dash-section">
                <h2>Continue Learning</h2>
                <div className="dash-courses-grid">
                  {approved.map(e => (
                    <div key={e.id} className="dash-course-card">
                      <div className="dash-course-thumb">
                        {e.thumbnail_url ? (
                          <img src={e.thumbnail_url} alt={e.title} />
                        ) : (
                          <div className="dash-course-thumb-placeholder">🎓</div>
                        )}
                      </div>
                      <div className="dash-course-body">
                        <h3>{e.title}</h3>
                        <p>{e.seller_name || 'Instructor'}</p>
                        <div className="dash-course-progress">
                          <div className="dash-progress-bar">
                            <div
                              className="dash-progress-fill"
                              style={{ width: `${e.progress_pct || 0}%` }}
                            />
                          </div>
                          <span>{e.progress_pct || 0}% complete</span>
                        </div>
                        <Link to={`/learn/${e.course_id}`} className="btn btn-primary dash-continue-btn">
                          ▶ Continue
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending */}
            {pending.length > 0 && (
              <div className="dash-section">
                <h2>Pending Requests</h2>
                <div className="dash-pending-list">
                  {pending.map(e => (
                    <div key={e.id} className="dash-pending-item">
                      <div className="dash-pending-thumb">
                        {e.thumbnail_url
                          ? <img src={e.thumbnail_url} alt={e.title} />
                          : <span>🎓</span>
                        }
                      </div>
                      <div className="dash-pending-info">
                        <h3>{e.title}</h3>
                        <p>by {e.seller_name || 'Instructor'}</p>
                      </div>
                      <div
                        className="dash-pending-status"
                        style={{
                          background: STATUS_CONFIG.pending.bg,
                          color: STATUS_CONFIG.pending.color,
                          border: `1px solid ${STATUS_CONFIG.pending.border}`,
                        }}
                      >
                        ⏳ Pending Review
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}