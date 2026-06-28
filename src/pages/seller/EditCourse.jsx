import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourseAPI, updateCourseAPI } from '../../api/courses'
import '../../styles/editcourse.css'

const CATEGORIES = ['Development', 'Design', 'Marketing', 'Business', 'Finance', 'Music', 'Photography', 'Other']
const LEVELS     = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
const LANGUAGES  = ['English', 'Hindi', 'Telugu', 'Tamil', 'Spanish', 'French', 'Other']

// ── Extracts clean 11-char YouTube ID from any format ──────────
function extractYoutubeId(input) {
  if (!input) return ''
  const s = input.trim()

  // Full URL: youtube.com/watch?v=XXXXXXXXXXX&t=100s
  const watchMatch = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch) return watchMatch[1]

  // Short URL: youtu.be/XXXXXXXXXXX?t=100s
  const shortMatch = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return shortMatch[1]

  // Embed URL: youtube.com/embed/XXXXXXXXXXX
  const embedMatch = s.match(/embed\/([a-zA-Z0-9_-]{11})/)
  if (embedMatch) return embedMatch[1]

  // Already just the ID (possibly with &t=... appended) — strip everything after & or ?
  const cleanId = s.split(/[&?]/)[0]
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanId)) return cleanId

  // Return whatever they typed — let the preview show if it works
  return s
}

export default function EditCourse() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const fileInputRef  = useRef(null)

  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [uploading,      setUploading]      = useState(false)
  const [error,          setError]          = useState('')
  const [success,        setSuccess]        = useState('')
  const [thumbError,     setThumbError]     = useState(false)  // YouTube thumb failed to load
  const [manualThumbUrl, setManualThumbUrl] = useState('')     // uploaded manually

  const [form, setForm] = useState({
    title:          '',
    subtitle:       '',
    description:    '',
    category:       '',
    level:          'Beginner',
    language:       'English',
    price:          '',
    youtube_id:     '',
    what_you_learn: '',
    requirements:   '',
  })

  // Clean YouTube ID → derive thumbnail URL
  const cleanYoutubeId   = extractYoutubeId(form.youtube_id)
  const youtubeThumbnail = cleanYoutubeId
    ? `https://img.youtube.com/vi/${cleanYoutubeId}/hqdefault.jpg`
    : null

  // Which thumbnail to actually display:
  // priority: manually uploaded > youtube auto > nothing
  const displayThumb = manualThumbUrl || (!thumbError && youtubeThumbnail ? youtubeThumbnail : null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCourseAPI(id)
        if (!data.success) { setError('Course not found.'); return }
        const c = data.course
        setForm({
          title:          c.title          || '',
          subtitle:       c.subtitle       || '',
          description:    c.description    || '',
          category:       c.category       || '',
          level:          c.level          || 'Beginner',
          language:       c.language       || 'English',
          price:          c.price          ?? '',
          youtube_id:     c.youtube_id     || '',
          what_you_learn: c.what_you_learn || '',
          requirements:   c.requirements   || '',
        })
        // If course already has a manually uploaded thumbnail, show it
        if (c.thumbnail_url && !c.thumbnail_url.includes('img.youtube.com')) {
          setManualThumbUrl(c.thumbnail_url)
        }
      } catch {
        setError('Failed to load course.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Reset thumb error when youtube_id changes so it retries
    if (name === 'youtube_id') {
      setThumbError(false)
      setManualThumbUrl('') // clear manual override when they set a new YT id
    }
  }

  // ── Manual thumbnail upload ────────────────────────────────
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, or WebP images are allowed for thumbnail.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Thumbnail must be under 5MB.')
      return
    }

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('thumbnail', file)

      const res  = await fetch(`${import.meta.env.VITE_API_URL}/courses/${id}/thumbnail`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()

      if (!data.success) throw new Error(data.message || 'Upload failed.')

      setManualThumbUrl(data.thumbnail_url)
      setThumbError(false)
    } catch (err) {
      setError(err.message || 'Thumbnail upload failed.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title || !form.category) {
      setError('Title and category are required.')
      return
    }

    setSaving(true)
    try {
      const data = await updateCourseAPI(id, {
        ...form,
        youtube_id: cleanYoutubeId,   // always save the clean ID
        price: Number(form.price) || 0,
      })

      if (!data.success) {
        setError(data.message || 'Failed to update.')
      } else {
        setSuccess('Course updated successfully!')
        setTimeout(() => navigate('/seller/courses'), 1200)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="edit-course-loading">
        <div className="ec-spinner" />
        <span>Loading course...</span>
      </div>
    )
  }

  return (
    <div className="edit-course-page">
      <div className="edit-course-container">

        {/* Header */}
        <div className="edit-course-header">
          <button className="edit-course-back-btn" onClick={() => navigate(-1)}>←</button>
          <h1>Edit Course</h1>
        </div>

        {error   && <div className="edit-course-alert edit-course-alert--error">⚠️ {error}</div>}
        {success && <div className="edit-course-alert edit-course-alert--success">✅ {success}</div>}

        <form className="edit-course-form" onSubmit={handleSubmit}>

          {/* ── Basic Info ─────────────────────────────────── */}
          <div className="edit-course-card">
            <h2 className="edit-course-card__title"><span>📝</span> Basic Information</h2>

            <div className="ec-form-group">
              <label className="ec-label">Course Title <span className="required">*</span></label>
              <input className="ec-input" name="title" value={form.title}
                onChange={handleChange} placeholder="e.g. Complete React Developer Course" required />
            </div>

            <div className="ec-form-group">
              <label className="ec-label">Subtitle</label>
              <input className="ec-input" name="subtitle" value={form.subtitle}
                onChange={handleChange} placeholder="Short tagline for your course" />
            </div>

            <div className="ec-form-group">
              <label className="ec-label">Description</label>
              <textarea className="ec-textarea" name="description" value={form.description}
                onChange={handleChange} rows={5} placeholder="What is this course about?" />
            </div>

            <div className="ec-grid-3">
              <div className="ec-form-group">
                <label className="ec-label">Category <span className="required">*</span></label>
                <select className="ec-select" name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="ec-form-group">
                <label className="ec-label">Level</label>
                <select className="ec-select" name="level" value={form.level} onChange={handleChange}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="ec-form-group">
                <label className="ec-label">Language</label>
                <select className="ec-select" name="language" value={form.language} onChange={handleChange}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Pricing & Media ────────────────────────────── */}
          <div className="edit-course-card">
            <h2 className="edit-course-card__title"><span>🎬</span> Pricing & Media</h2>

            <div className="ec-form-group">
              <label className="ec-label">Price</label>
              <div className="ec-price-wrapper" style={{ maxWidth: 180 }}>
                <span className="ec-price-symbol">₹</span>
                <input className="ec-input" type="number" name="price" value={form.price}
                  onChange={handleChange} placeholder="0 for free" min="0" />
              </div>
            </div>

            {/* YouTube ID input */}
            <div className="ec-form-group">
              <label className="ec-label">YouTube Video ID / URL</label>
              <input
                className="ec-input"
                name="youtube_id"
                value={form.youtube_id}
                onChange={handleChange}
                placeholder="Paste full YouTube URL or just the video ID"
              />
              <p className="ec-hint">
                e.g. <code>https://youtube.com/watch?v=dQw4w9WgXcQ</code> or just <code>dQw4w9WgXcQ</code>
              </p>
            </div>

            {/* ── Thumbnail Section ─────────────────────── */}
            <div className="ec-thumbnail-section">
              <div className="ec-thumbnail-section__left">
                <p className="ec-label" style={{ marginBottom: '0.5rem' }}>Course Thumbnail</p>

                {/* Thumbnail display */}
                {displayThumb ? (
                  <div className="ec-thumb-display">
                    <img
                      src={displayThumb}
                      alt="Course thumbnail"
                      onError={() => {
                        // YouTube thumb failed — show upload prompt
                        if (!manualThumbUrl) setThumbError(true)
                      }}
                    />
                    {/* Overlay edit button on the image */}
                    <button
                      type="button"
                      className="ec-thumb-edit-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <span className="ec-btn-spinner" /> : '📷 Change'}
                    </button>
                  </div>
                ) : (
                  // No thumbnail at all — show upload box
                  <div
                    className="ec-thumb-upload-box"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <>
                        <div className="ec-spinner" style={{ width: 28, height: 28 }} />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span className="ec-thumb-upload-box__icon">🖼️</span>
                        <span className="ec-thumb-upload-box__title">Upload Thumbnail</span>
                        <span className="ec-thumb-upload-box__hint">JPG, PNG or WebP · Max 5MB · 16:9 recommended</span>
                      </>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  onChange={handleThumbnailUpload}
                />
              </div>

              {/* Status note */}
              <div className="ec-thumbnail-section__right">
                {manualThumbUrl && (
                  <div className="ec-thumb-status ec-thumb-status--manual">
                    ✅ Custom thumbnail uploaded
                  </div>
                )}
                {!manualThumbUrl && youtubeThumbnail && !thumbError && (
                  <div className="ec-thumb-status ec-thumb-status--auto">
                    🎬 Auto-set from YouTube video
                  </div>
                )}
                {thumbError && !manualThumbUrl && (
                  <div className="ec-thumb-status ec-thumb-status--warn">
                    ⚠️ YouTube thumbnail unavailable — please upload one manually
                  </div>
                )}
                <p className="ec-hint" style={{ marginTop: '0.5rem' }}>
                  If you add a YouTube video, the thumbnail is set automatically.<br />
                  You can always override it by uploading your own image.
                </p>
              </div>
            </div>

          </div>

          {/* ── Learning Outcomes ──────────────────────────── */}
          <div className="edit-course-card">
            <h2 className="edit-course-card__title"><span>🎯</span> Learning Outcomes</h2>

            <div className="ec-form-group">
              <label className="ec-label">What Students Will Learn</label>
              <textarea className="ec-textarea" name="what_you_learn" value={form.what_you_learn}
                onChange={handleChange} rows={4} placeholder="List key takeaways, one per line" />
            </div>

            <div className="ec-form-group">
              <label className="ec-label">Requirements / Prerequisites</label>
              <textarea className="ec-textarea" name="requirements" value={form.requirements}
                onChange={handleChange} rows={3} placeholder="What should students know before taking this?" />
            </div>
          </div>

          {/* ── Actions ───────────────────────────────────── */}
          <div className="edit-course-actions">
            <button type="submit" className="ec-btn-save" disabled={saving || uploading}>
              {saving
                ? <><div className="ec-btn-spinner" /> Saving…</>
                : '💾 Save Changes'}
            </button>
            <button type="button" className="ec-btn-cancel" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}