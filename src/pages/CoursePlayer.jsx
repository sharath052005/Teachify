import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCourseAPI } from '../api/courses'
import { checkEnrollmentAPI, getProgressAPI, markLessonAPI } from '../api/enrollments'
import { DUMMY_COURSES } from '../data/dummy'
import { useAuth } from '../context/AuthContext'
import VideoPlayer from '../components/VideoPlayer'
import '../styles/courseplayer.css'

export default function CoursePlayer() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()

  const [course, setCourse]           = useState(null)
  const [activeLesson, setActive]     = useState(null)
  const [progress, setProgress]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [sidebarOpen, setSidebar]     = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadData()
  }, [id, user])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getCourseAPI(id)
      const courseData = data.course
      setCourse(courseData)

      // Check enrollment
      const enrollData = await checkEnrollmentAPI(id)
      if (!enrollData.enrollment || enrollData.enrollment.status !== 'approved') {
        // For dummy courses allow access
        if (!courseData.is_dummy) {
          navigate(`/courses/${id}`)
          return
        }
      }

      // Set first lesson as active
      const firstSection = courseData.sections?.[0]
      const firstLesson  = firstSection?.lessons?.[0]
      if (firstLesson) setActive(firstLesson)

      // Load progress
      try {
        const progData = await getProgressAPI(id)
        setProgress(progData.completed_lessons || [])
      } catch {}

    } catch {
      // Try dummy course
      const dummy = DUMMY_COURSES.find(c => String(c.id) === String(id))
      if (dummy) {
        setCourse(dummy)
        // Create fake lesson for dummy
        setActive({ id: 'demo', title: dummy.title, youtube_id: dummy.youtube_id, is_preview: true })
      } else {
        navigate('/courses')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!activeLesson || activeLesson.id === 'demo') return
    try {
      await markLessonAPI(activeLesson.id, true)
      setProgress(prev => [...prev, activeLesson.id])
    } catch {}
  }

  const isCompleted = (lessonId) => progress.includes(lessonId)

  const allLessons = course?.sections?.flatMap(s => s.lessons || []) || []
  const completedCount = allLessons.filter(l => isCompleted(l.id)).length
  const progressPct = allLessons.length > 0
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  )

  if (!course) return null

  return (
    <div className="player-page">

      {/* Top bar */}
      <div className="player-topbar">
        <Link to="/dashboard" className="player-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Back
        </Link>
        <div className="player-course-title">{course.title}</div>
        <div className="player-progress-wrap">
          <div className="player-progress-bar">
            <div className="player-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span>{progressPct}% complete</span>
        </div>
        <button
          className="player-sidebar-toggle"
          onClick={() => setSidebar(!sidebarOpen)}
        >
          {sidebarOpen ? '→ Hide' : '← Show'} Content
        </button>
      </div>

      <div className="player-body">

        {/* Main video area */}
        <div className="player-main">
          <div className="player-video-wrap">
            <VideoPlayer
              youtubeId={activeLesson?.youtube_id}
              title={activeLesson?.title}
            />
          </div>

          <div className="player-lesson-info">
            <h2>{activeLesson?.title || 'Select a lesson'}</h2>
            {activeLesson && activeLesson.id !== 'demo' && (
              <button
                className={`btn ${isCompleted(activeLesson.id) ? 'btn-outline' : 'btn-primary'} player-complete-btn`}
                onClick={handleMarkComplete}
                disabled={isCompleted(activeLesson.id)}
              >
                {isCompleted(activeLesson.id) ? '✓ Completed' : 'Mark as Complete'}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="player-sidebar">
            <div className="player-sidebar__header">
              <h3>Course Content</h3>
              <span>{allLessons.length} lessons</span>
            </div>

            {course.sections?.map((section, si) => (
              <div key={section.id || si} className="player-section">
                <div className="player-section-title">{section.title}</div>
                {section.lessons?.map(lesson => (
                  <button
                    key={lesson.id}
                    className={`player-lesson ${activeLesson?.id === lesson.id ? 'active' : ''}`}
                    onClick={() => setActive(lesson)}
                  >
                    <span className={`player-lesson-icon ${isCompleted(lesson.id) ? 'completed' : ''}`}>
                      {isCompleted(lesson.id) ? '✓' : '▶'}
                    </span>
                    <span className="player-lesson-title">{lesson.title}</span>
                    {lesson.duration_min > 0 && (
                      <span className="player-lesson-dur">{lesson.duration_min}m</span>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {/* Dummy course fallback */}
            {(!course.sections || course.sections.length === 0) && activeLesson && (
              <div className="player-section">
                <div className="player-section-title">Course Preview</div>
                <button className="player-lesson active">
                  <span className="player-lesson-icon">▶</span>
                  <span className="player-lesson-title">{activeLesson.title}</span>
                </button>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}