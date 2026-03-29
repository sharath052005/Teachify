import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCourseAPI } from '../api/courses'
import { checkEnrollmentAPI, requestEnrollAPI } from '../api/enrollments'
import { DUMMY_COURSES } from '../data/dummy'
import { useAuth } from '../context/AuthContext'
import VideoPlayer from '../components/VideoPlayer'
import '../styles/coursedetails.css'

export default function CourseDetails() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()

  const [course, setCourse]           = useState(null)
  const [enrollment, setEnrollment]   = useState(null)
  const [loading, setLoading]         = useState(true)
  const [requesting, setRequesting]   = useState(false)
  const [success, setSuccess]         = useState('')
  const [error, setError]             = useState('')
  const [expandedSection, setExpanded] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    loadCourse()
  }, [id])

  useEffect(() => {
    if (user && course) {
      checkEnrollmentAPI(course.id)
        .then(data => setEnrollment(data.enrollment))
        .catch(() => {})
    }
  }, [user, course?.id])

  const loadCourse = async () => {
    setLoading(true)
    try {
      const data = await getCourseAPI(id)
      setCourse(data.course)
    } catch {
      // fallback to dummy
      const dummy = DUMMY_COURSES.find(c => String(c.id) === String(id))
      setCourse(dummy || null)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAccess = async () => {
    if (!user) { navigate('/login'); return }
    setRequesting(true)
    setError('')
    try {
      await requestEnrollAPI(course.id)
      setSuccess('Access request sent! The instructor will review and respond soon.')
      setEnrollment({ status: 'pending' })
    } catch (err) {
      setError(err.message)
    } finally {
      setRequesting(false)
    }
  }

  const formatPrice = (p) => p === 0 ? 'Free' : `₹${Number(p).toLocaleString('en-IN')}`
  const renderStars = (r) => '★'.repeat(Math.floor(r || 0)) + '☆'.repeat(5 - Math.floor(r || 0))

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  )

  if (!course) return (
    <div className="loading-screen">
      <div>
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>
          Browse Courses
        </Link>
      </div>
    </div>
  )

  const isDummy  = course.is_dummy
  const sections = course.sections || []
  const skills   = Array.isArray(course.what_you_learn)
    ? course.what_you_learn
    : (course.what_you_learn ? course.what_you_learn.split('\n').filter(Boolean) : [])

  const requirements = Array.isArray(course.requirements)
    ? course.requirements
    : (course.requirements ? course.requirements.split('\n').filter(Boolean) : [])

  return (
    <div className="cd-page page-enter">

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="cd-hero">
        <div className="cd-hero__bg" />
        <div className="container cd-hero__content">
          <div className="cd-hero__left">
            <div className="cd-breadcrumb">
              <Link to="/courses">Courses</Link>
              {course.category && (
                <>
                  <span>›</span>
                  <Link to={`/courses?category=${encodeURIComponent(course.category)}`}>
                    {course.category}
                  </Link>
                </>
              )}
            </div>

            <h1 className="cd-title">{course.title}</h1>
            {course.subtitle && <p className="cd-subtitle">{course.subtitle}</p>}

            <div className="cd-meta">
              {course.rating > 0 && (
                <div className="cd-rating">
                  <span className="cd-rating__stars">{renderStars(course.rating)}</span>
                  <span className="cd-rating__val">{Number(course.rating).toFixed(1)}</span>
                  <span className="cd-rating__count">({Number(course.review_count || 0).toLocaleString()} ratings)</span>
                </div>
              )}
              {course.student_count > 0 && (
                <span className="cd-meta__item">👥 {Number(course.student_count).toLocaleString()} students</span>
              )}
            </div>

            <div className="cd-tags">
              {course.level && <span className="badge badge-purple">{course.level}</span>}
              {course.language && <span className="badge badge-dark">{course.language}</span>}
              {course.total_hours > 0 && <span className="badge badge-amber">⏱ {course.total_hours}h content</span>}
              {course.total_lessons > 0 && <span className="badge badge-green">📹 {course.total_lessons} lessons</span>}
            </div>

            <p className="cd-instructor">
              Created by{' '}
              <strong>{course.instructor || course.seller_name || 'Expert Instructor'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────── */}
      <div className="container cd-body">
        <div className="cd-content">

          {/* Preview Video */}
          <div className="cd-section">
            <h2>Course Preview</h2>
            <VideoPlayer
              youtubeId={course.youtube_id || course.preview_video}
              title={course.title}
            />
          </div>

          {/* What you'll learn */}
          {skills.length > 0 && (
            <div className="cd-section cd-learn-box">
              <h2>What you'll learn</h2>
              <div className="cd-learn-grid">
                {skills.map((s, i) => (
                  <div key={i} className="cd-learn-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course content */}
          {sections.length > 0 && (
            <div className="cd-section">
              <h2>Course Content</h2>
              <p className="cd-section-sub">
                {sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0)} lessons ·{' '}
                {course.total_hours}h total
              </p>
              <div className="cd-sections">
                {sections.map((section, i) => (
                  <div key={section.id} className="cd-section-item">
                    <button
                      className={`cd-section-header ${expandedSection === i ? 'open' : ''}`}
                      onClick={() => setExpanded(expandedSection === i ? -1 : i)}
                    >
                      <div>
                        <strong>{section.title}</strong>
                        <span>{section.lessons?.length || 0} lessons</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        style={{ transform: expandedSection === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                      >
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>

                    {expandedSection === i && section.lessons?.map(lesson => (
                      <div key={lesson.id} className="cd-lesson-item">
                        <div className="cd-lesson-left">
                          {lesson.is_preview ? (
                            <span className="cd-lesson-play">▶</span>
                          ) : (
                            <span className="cd-lesson-lock">🔒</span>
                          )}
                          <span>{lesson.title}</span>
                          {lesson.is_preview && (
                            <span className="cd-preview-badge">Preview</span>
                          )}
                        </div>
                        {lesson.duration_min > 0 && (
                          <span className="cd-lesson-dur">{lesson.duration_min}m</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {requirements.length > 0 && (
            <div className="cd-section">
              <h2>Requirements</h2>
              <ul className="cd-req-list">
                {requirements.map((r, i) => (
                  <li key={i}>
                    <span className="cd-req-dot">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {course.description && (
            <div className="cd-section">
              <h2>About this course</h2>
              <p className="cd-description">{course.description}</p>
            </div>
          )}

        </div>

        {/* ── SIDEBAR ────────────────────────────────────── */}
        <aside className="cd-sidebar">
          <div className="cd-buy-card">
            {/* Thumbnail */}
            <div className="cd-buy-thumb">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} />
              ) : (
                <VideoPlayer youtubeId={course.youtube_id} title={course.title} />
              )}
            </div>

            <div className="cd-buy-body">
              <div className="cd-buy-price">
                {formatPrice(course.price)}
              </div>

              {/* Enrollment status & CTA */}
              {success && <div className="toast" style={{ marginBottom: 12 }}>{success}</div>}
              {error   && <div className="toast toast-error" style={{ marginBottom: 12 }}>{error}</div>}

              {enrollment ? (
                enrollment.status === 'approved' ? (
                  <Link to={`/learn/${course.id}`} className="btn btn-primary cd-enroll-btn">
                    ▶ Continue Learning
                  </Link>
                ) : enrollment.status === 'pending' ? (
                  <div className="cd-pending-notice">
                    <span>⏳</span>
                    <div>
                      <strong>Request Pending</strong>
                      <p>Waiting for instructor approval</p>
                    </div>
                  </div>
                ) : (
                  <div className="cd-rejected-notice">
                    <span>❌</span>
                    <p>Your request was not approved</p>
                  </div>
                )
              ) : isDummy ? (
                <button
                  className="btn btn-primary cd-enroll-btn"
                  onClick={() => { if (!user) navigate('/login') }}
                >
                  {user ? '🔒 Demo Course' : 'Login to Enroll'}
                </button>
              ) : (
                <button
                  className="btn btn-primary cd-enroll-btn"
                  onClick={handleRequestAccess}
                  disabled={requesting}
                >
                  {requesting
                    ? <><span className="spinner spinner--sm" /> Sending...</>
                    : '🚀 Request Access'
                  }
                </button>
              )}

              {/* Course includes */}
              <div className="cd-includes">
                <h4>This course includes:</h4>
                {[
                  course.total_hours > 0 && `⏱ ${course.total_hours}h on-demand video`,
                  course.total_lessons > 0 && `📹 ${course.total_lessons} video lessons`,
                  '♾️ Full lifetime access',
                  '📱 Access on mobile & desktop',
                  '🏆 Certificate of completion',
                ].filter(Boolean).map((item, i) => (
                  <div key={i} className="cd-include-item">{item}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructor */}
          <div className="cd-instructor-card">
            <h4>Your Instructor</h4>
            <div className="cd-instructor-info">
              <div className="cd-instructor-avatar">
                {course.instructor_avatar || (course.seller_name || 'I')[0].toUpperCase()}
              </div>
              <div>
                <strong>{course.instructor || course.seller_name || 'Expert Instructor'}</strong>
                <span>{course.category} Expert</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}