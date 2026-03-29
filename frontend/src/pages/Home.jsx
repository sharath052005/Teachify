import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import { getCoursesAPI } from '../api/courses'
import { DUMMY_COURSES, CATEGORIES, STATS, TESTIMONIALS } from '../data/dummy'
import '../styles/home.css'

export default function Home() {
  const [searchQ, setSearchQ]   = useState('')
  const [liveCourses, setLive]  = useState([])
  const navigate                = useNavigate()

  useEffect(() => {
    getCoursesAPI({ limit: 4 })
      .then(data => setLive(data.courses || []))
      .catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) navigate(`/courses?q=${encodeURIComponent(searchQ.trim())}`)
  }

  const displayCourses = liveCourses.length > 0
    ? liveCourses
    : DUMMY_COURSES.slice(0, 4)

  return (
    <div className="home page-enter">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__grid" />
        </div>

        <div className="container hero__content">
          <div className="hero__left">
            <div className="hero__badge">
              <span className="hero__badge-pulse" />
              🚀 Join 75,000+ learners on Teachify
            </div>

            <h1 className="hero__title">
              Learn Without
              <span className="hero__title-accent"> Limits</span>
            </h1>

            <p className="hero__subtitle">
              Master in-demand skills from expert instructors.
              Video courses, real projects, lifetime access.
            </p>

            <form className="hero__search" onSubmit={handleSearch}>
              <div className="hero__search-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="What do you want to learn today?"
                />
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </div>
            </form>

            <div className="hero__suggestions">
              <span>Trending:</span>
              {['React.js', 'Python', 'Machine Learning', 'UI/UX Design', 'AWS'].map(s => (
                <Link key={s} to={`/courses?q=${s}`} className="hero__tag">{s}</Link>
              ))}
            </div>
          </div>

          <div className="hero__right">
            <div className="hero__visual">
              <div className="hero__card-float hero__card-float--1">
                <div className="hero__card-float-icon">🎯</div>
                <div>
                  <strong>Project-based</strong>
                  <p>Real-world experience</p>
                </div>
              </div>
              <div className="hero__card-float hero__card-float--2">
                <div className="hero__card-float-icon">⚡</div>
                <div>
                  <strong>Lifetime Access</strong>
                  <p>Learn at your pace</p>
                </div>
              </div>
              <div className="hero__card-float hero__card-float--3">
                <div className="hero__card-float-icon">🏆</div>
                <div>
                  <strong>Certificate</strong>
                  <p>On completion</p>
                </div>
              </div>
              <div className="hero__illustration">
                <div className="hero__illustration-inner">
                  <span className="hero__illustration-icon">🎓</span>
                  <p>Start Learning Today</p>
                  <div className="hero__illustration-avatars">
                    {['A','B','C','D','E'].map((l,i) => (
                      <div key={l} className="hero__mini-avatar" style={{ zIndex: 5-i }}>{l}</div>
                    ))}
                    <span>+73K students</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="hero__stats-bar">
          <div className="container">
            <div className="hero__stats">
              {STATS.map(s => (
                <div key={s.label} className="hero__stat">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-label">Explore Topics</p>
              <h2 className="section-title">Browse by Category</h2>
            </div>
            <Link to="/courses" className="btn btn-outline">All Categories →</Link>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/courses?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
                style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
              >
                <span className="category-card__icon">{cat.icon}</span>
                <h3>{cat.name}</h3>
                <p>{cat.count} courses</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ──────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-label">Top Picks</p>
              <h2 className="section-title">Featured Courses</h2>
            </div>
            <Link to="/courses" className="btn btn-outline">View All →</Link>
          </div>
          <div className="courses-grid courses-grid--4">
            {displayCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY TEACHIFY ──────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <p className="section-label">Why Choose Us</p>
              <h2 className="section-title">Everything you need to succeed</h2>
            </div>
          </div>
          <div className="features-grid">
            {[
              { icon: '🎬', title: 'HD Video Content', desc: 'High-quality video lessons from expert instructors you can watch anytime.' },
              { icon: '♾️', title: 'Lifetime Access', desc: 'Buy once, access forever. Come back whenever you need a refresher.' },
              { icon: '📱', title: 'Learn Anywhere', desc: 'Access courses on any device — desktop, tablet, or mobile.' },
              { icon: '🏆', title: 'Earn Certificates', desc: 'Get shareable certificates upon completing courses.' },
              { icon: '💬', title: 'Community Support', desc: 'Connect with fellow learners and instructors in discussion forums.' },
              { icon: '🔄', title: 'Regular Updates', desc: 'Courses are updated regularly to keep content fresh and relevant.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR NOW ───────────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-label">Most Popular</p>
              <h2 className="section-title">Trending Right Now</h2>
            </div>
            <Link to="/courses" className="btn btn-outline">See all →</Link>
          </div>
          <div className="courses-grid courses-grid--4">
            {DUMMY_COURSES.slice(4).map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <p className="section-label">Student Stories</p>
              <h2 className="section-title">What our learners say</h2>
            </div>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-card__stars">
                  {'★'.repeat(t.rating)}
                </div>
                <p className="testimonial-card__text">"{t.text}"</p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">{t.avatar}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                    <p className="testimonial-card__course">📚 {t.course}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BECOME INSTRUCTOR ─────────────────────────────── */}
      <section className="instructor-cta">
        <div className="container">
          <div className="instructor-cta__inner">
            <div className="instructor-cta__content">
              <h2>Share Your Knowledge with the World</h2>
              <p>Join thousands of expert instructors on Teachify. Create and sell online courses, build your audience, and earn on your own terms.</p>
              <div className="instructor-cta__features">
                {['Earn up to ₹50,000/month', 'Reach 75K+ students', 'Full creative control', 'Lifetime royalties'].map(f => (
                  <span key={f} className="instructor-cta__feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    {f}
                  </span>
                ))}
              </div>
              <Link to="/signup?role=seller" className="btn btn-white instructor-cta__btn">
                Start Teaching Today →
              </Link>
            </div>
            <div className="instructor-cta__visual">
              <div className="instructor-cta__card">
                <div className="instructor-cta__avatar">🧑‍🏫</div>
                <strong>Become an Instructor</strong>
                <p>Share what you know. Build your brand.</p>
                <div className="instructor-cta__mini-stats">
                  <div><strong>₹0</strong><span>to start</span></div>
                  <div><strong>75K+</strong><span>students</span></div>
                  <div><strong>350+</strong><span>instructors</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}