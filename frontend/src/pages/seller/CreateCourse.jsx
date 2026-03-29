import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createCourseAPI, addSectionAPI, addLessonAPI, publishCourseAPI } from '../../api/courses'
import '../../styles/createcourse.css'

const CATEGORIES = ['Web Development','Data Science','Mobile','Design','Backend','Cloud','Programming','Business','Marketing','Personal Development']
const LEVELS     = ['Beginner','Intermediate','Advanced','All Levels']

export default function CreateCourse() {
  const navigate  = useNavigate()
  const [step, setStep]       = useState(1) // 1=details, 2=content, 3=publish
  const [saving, setSaving]   = useState(false)
  const [courseId, setCourseId] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    title: '', subtitle: '', description: '', category: '',
    level: 'Beginner', language: 'English', price: '',
    youtube_id: '', what_you_learn: '', requirements: '',
  })

  const [sections, setSections] = useState([
    { title: 'Introduction', lessons: [{ title: '', youtube_id: '', duration_min: '', is_preview: true }] }
  ])

  const upd = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const addSection = () => {
    setSections(s => [...s, { title: '', lessons: [{ title: '', youtube_id: '', duration_min: '', is_preview: false }] }])
  }

  const removeSection = (si) => {
    setSections(s => s.filter((_, i) => i !== si))
  }

  const addLesson = (si) => {
    setSections(s => s.map((sec, i) => i === si
      ? { ...sec, lessons: [...sec.lessons, { title: '', youtube_id: '', duration_min: '', is_preview: false }] }
      : sec
    ))
  }

  const removeLesson = (si, li) => {
    setSections(s => s.map((sec, i) => i === si
      ? { ...sec, lessons: sec.lessons.filter((_, j) => j !== li) }
      : sec
    ))
  }

  const updateSection = (si, val) => {
    setSections(s => s.map((sec, i) => i === si ? { ...sec, title: val } : sec))
  }

  const updateLesson = (si, li, field, val) => {
    setSections(s => s.map((sec, i) => i === si
      ? {
          ...sec,
          lessons: sec.lessons.map((l, j) => j === li ? { ...l, [field]: val } : l)
        }
      : sec
    ))
  }

  // Step 1 — Save course details
  const handleSaveDetails = async () => {
    if (!form.title || !form.category) {
      setError('Title and category are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const data = await createCourseAPI({
        ...form,
        price: Number(form.price) || 0,
      })
      setCourseId(data.course_id)
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Step 2 — Save sections and lessons
  const handleSaveContent = async () => {
    if (!courseId) return
    setSaving(true)
    setError('')
    try {
      for (const section of sections) {
        if (!section.title.trim()) continue
        const secData = await addSectionAPI(courseId, { title: section.title })
        const sectionId = secData.section_id
        for (const lesson of section.lessons) {
          if (!lesson.title.trim() || !lesson.youtube_id.trim()) continue
          await addLessonAPI(sectionId, {
            title:        lesson.title,
            youtube_id:   lesson.youtube_id,
            duration_min: Number(lesson.duration_min) || 0,
            is_preview:   lesson.is_preview || false,
          })
        }
      }
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Step 3 — Publish
  const handlePublish = async () => {
    if (!courseId) return
    setSaving(true)
    try {
      await publishCourseAPI(courseId)
      setSuccess('Course published successfully! 🎉')
      setTimeout(() => navigate('/seller/courses'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const STEPS = ['Course Details', 'Add Content', 'Publish']

  return (
    <div className="create-page page-enter">
      <div className="container">

        {/* Header */}
        <div className="create-header">
          <Link to="/seller/courses" className="create-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Back
            </Link>
            <h1>Create New Course</h1>
        </div>
        {/* Progress */}
    <div className="create-progress">
      {STEPS.map((s, i) => (
        <div key={s} className={`create-step ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'done' : ''}`}>
          <div className="create-step-num">
            {i + 1 < step ? '✓' : i + 1}
          </div>
          <span>{s}</span>
          {i < STEPS.length - 1 && <div className="create-step-line" />}
        </div>
      ))}
    </div>

    {error   && <div className="toast toast-error">{error}</div>}
    {success && <div className="toast">{success}</div>}

    <div className="create-layout">
      <div className="create-main">

        {/* ── STEP 1: Details ────────────────────────────── */}
        {step === 1 && (
          <div className="create-card">
            <h2>Course Details</h2>

            <div className="form-field">
              <label>Course Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => upd('title', e.target.value)}
                placeholder="e.g. Complete React.js Bootcamp 2024"
                maxLength={200}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{form.title.length}/200</span>
            </div>

            <div className="form-field">
              <label>Subtitle</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={e => upd('subtitle', e.target.value)}
                placeholder="A brief summary of what students will learn"
                maxLength={300}
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Category *</label>
                <select value={form.category} onChange={e => upd('category', e.target.value)}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Level</label>
                <select value={form.level} onChange={e => upd('level', e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Language</label>
                <select value={form.language} onChange={e => upd('language', e.target.value)}>
                  {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => upd('price', e.target.value)}
                  placeholder="0 for Free"
                  min="0"
                />
              </div>
            </div>

            <div className="form-field">
              <label>Preview / Intro YouTube Video ID</label>
              <input
                type="text"
                value={form.youtube_id}
                onChange={e => upd('youtube_id', e.target.value)}
                placeholder="e.g. bMknfKXIFA8 (from youtube.com/watch?v=bMknfKXIFA8)"
              />
              <span className="create-hint">
                💡 This video appears on the course detail page as a preview
              </span>
            </div>

            <div className="form-field">
              <label>What students will learn</label>
              <textarea
                rows={4}
                value={form.what_you_learn}
                onChange={e => upd('what_you_learn', e.target.value)}
                placeholder="Enter each learning outcome on a new line:&#10;- Build real React applications&#10;- Master Hooks and Context&#10;- Deploy to production"
              />
            </div>

            <div className="form-field">
              <label>Requirements / Prerequisites</label>
              <textarea
                rows={3}
                value={form.requirements}
                onChange={e => upd('requirements', e.target.value)}
                placeholder="Enter each requirement on a new line:&#10;- Basic HTML knowledge&#10;- A computer with internet access"
              />
            </div>

            <div className="form-field">
              <label>Course Description</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={e => upd('description', e.target.value)}
                placeholder="Write a detailed description of your course. What will students achieve? Why should they enroll?"
              />
            </div>

            <div className="create-nav">
              <button
                className="btn btn-primary"
                onClick={handleSaveDetails}
                disabled={saving}
              >
                {saving ? <span className="spinner spinner--sm" /> : 'Save & Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Content ────────────────────────────── */}
        {step === 2 && (
          <div className="create-card">
            <h2>Course Content</h2>
            <p className="create-section-desc">
              Add sections and lessons. Each lesson needs a YouTube Video ID.
              Get it from the URL: youtube.com/watch?v=<strong>THIS_PART</strong>
            </p>

            {sections.map((section, si) => (
              <div key={si} className="create-section">
                <div className="create-section-header">
                  <div className="form-field" style={{ flex: 1 }}>
                    <label>Section {si + 1} Title</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={e => updateSection(si, e.target.value)}
                      placeholder="e.g. Getting Started, Advanced Topics"
                    />
                  </div>
                  {sections.length > 1 && (
                    <button
                      className="create-remove-btn"
                      onClick={() => removeSection(si)}
                      title="Remove section"
                    >
                      🗑
                    </button>
                  )}
                </div>

                {section.lessons.map((lesson, li) => (
                  <div key={li} className="create-lesson">
                    <div className="create-lesson-row">
                      <div className="form-field" style={{ flex: 2 }}>
                        <label>Lesson {li + 1} Title</label>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={e => updateLesson(si, li, 'title', e.target.value)}
                          placeholder="e.g. Introduction to React Hooks"
                        />
                      </div>
                      <div className="form-field" style={{ flex: 1.5 }}>
                        <label>YouTube ID</label>
                        <input
                          type="text"
                          value={lesson.youtube_id}
                          onChange={e => updateLesson(si, li, 'youtube_id', e.target.value)}
                          placeholder="e.g. bMknfKXIFA8"
                        />
                      </div>
                      <div className="form-field" style={{ flex: 0.6 }}>
                        <label>Duration (min)</label>
                        <input
                          type="number"
                          value={lesson.duration_min}
                          onChange={e => updateLesson(si, li, 'duration_min', e.target.value)}
                          placeholder="10"
                          min="0"
                        />
                      </div>
                      <div className="create-lesson-controls">
                        <label className="create-preview-check">
                          <input
                            type="checkbox"
                            checked={lesson.is_preview}
                            onChange={e => updateLesson(si, li, 'is_preview', e.target.checked)}
                          />
                          Preview
                        </label>
                        {section.lessons.length > 1 && (
                          <button
                            className="create-remove-btn"
                            onClick={() => removeLesson(si, li)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  className="btn btn-ghost create-add-lesson-btn"
                  onClick={() => addLesson(si)}
                >
                  + Add Lesson
                </button>
              </div>
            ))}

            <button
              className="btn btn-outline create-add-section-btn"
              onClick={addSection}
            >
              + Add Section
            </button>

            <div className="create-nav">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button
                className="btn btn-primary"
                onClick={handleSaveContent}
                disabled={saving}
              >
                {saving ? <span className="spinner spinner--sm" /> : 'Save Content →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Publish ────────────────────────────── */}
        {step === 3 && (
          <div className="create-card create-publish-card">
            <div className="create-publish-icon">🚀</div>
            <h2>Ready to Publish!</h2>
            <p>
              Your course has been saved. Publishing will make it visible to all students on Teachify.
            </p>

            <div className="create-publish-checklist">
              {[
                { label: 'Course title added', done: !!form.title },
                { label: 'Category selected', done: !!form.category },
                { label: 'Preview video added', done: !!form.youtube_id },
                { label: 'Sections and lessons added', done: sections.some(s => s.lessons.some(l => l.youtube_id)) },
              ].map(item => (
                <div key={item.label} className={`create-check-item ${item.done ? 'done' : ''}`}>
                  <span>{item.done ? '✅' : '⭕'}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="create-nav create-publish-actions">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate('/seller/courses')}
                >
                  Save as Draft
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handlePublish}
                  disabled={saving}
                  style={{ padding: '12px 28px' }}
                >
                  {saving ? <span className="spinner spinner--sm" /> : '🚀 Publish Course'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips sidebar */}
      <aside className="create-tips">
        <h3>💡 Tips</h3>
        {step === 1 && [
          { icon: '🎯', tip: 'Be specific with your title — it helps students find your course.' },
          { icon: '💰', tip: 'Set a competitive price or make it Free to attract more students.' },
          { icon: '▶', tip: 'Add a compelling preview video — this is what students see first.' },
          { icon: '📝', tip: 'Write clear learning outcomes — they show up on the course page.' },
        ].map(t => (
          <div key={t.icon} className="create-tip">
            <span>{t.icon}</span>
            <p>{t.tip}</p>
          </div>
        ))}
        {step === 2 && [
          { icon: '📂', tip: 'Organize content into logical sections — keeps learners on track.' },
          { icon: '▶', tip: 'YouTube ID is the last part of the video URL after v=.' },
          { icon: '🔓', tip: 'Mark the first 1-2 lessons as Preview so students can try before enrolling.' },
          { icon: '⏱', tip: 'Add accurate durations so students can plan their learning time.' },
        ].map(t => (
          <div key={t.icon} className="create-tip">
            <span>{t.icon}</span>
            <p>{t.tip}</p>
          </div>
        ))}
        {step === 3 && [
          { icon: '✅', tip: 'Published courses are immediately visible to all students.' },
          { icon: '📝', tip: 'You can edit the course anytime after publishing.' },
          { icon: '📣', tip: 'Share your course link on social media to get your first students.' },
        ].map(t => (
          <div key={t.icon} className="create-tip">
            <span>{t.icon}</span>
            <p>{t.tip}</p>
          </div>
        ))}
      </aside>
    </div>
  </div>
</div>
  )}