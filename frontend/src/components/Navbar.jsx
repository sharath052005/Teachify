import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQ, setSearchQ]           = useState('')
  const { user, logout }                = useAuth()
  const location                        = useLocation()
  const navigate                        = useNavigate()
  const dropdownRef                     = useRef(null)
  const isSeller                        = user?.role === 'seller'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
    
  useEffect(() => {
    setMenuOpen(false)
    setDropdownOpen(false)
  }, [location])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQ.trim())}`)
      setSearchQ('')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">

          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-icon">
              <img src="/logo.png" alt="Logo" className="navbar-logo" />
            </div>
            <span>Teach<strong>ify</strong></span>
          </Link>

          {/* Search bar — desktop */}
          <form className="navbar__search" onSubmit={handleSearch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search for courses..."
            />
          </form>

          {/* Nav links */}
          <ul className="navbar__links">
            <li><Link to="/courses">Browse</Link></li>
            {isSeller && (
              <li><Link to="/seller">Teach on Teachify</Link></li>
            )}
          </ul>

          {/* Auth */}
          <div className="navbar__auth">
            {user ? (
              <div className="navbar__profile" ref={dropdownRef}>
                <button
                  className="navbar__avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="navbar__avatar-img" />
                  ) : (
                    <div className="navbar__avatar-letter">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <svg
                    className={`navbar__chevron ${dropdownOpen ? 'open' : ''}`}
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-user">
                      <div className="navbar__dropdown-avatar">
                        {user.avatar
                          ? <img src={user.avatar} alt={user.name} />
                          : <div className="navbar__dropdown-letter">{user.name?.[0]?.toUpperCase()}</div>
                        }
                      </div>
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        <div className={`navbar__role-badge ${isSeller ? 'seller' : 'buyer'}`}>
                          {isSeller ? '🎓 Instructor' : '📚 Learner'}
                        </div>
                      </div>
                    </div>

                    <div className="navbar__dropdown-divider" />

                    {isSeller ? (
                      <>
                        <Link to="/seller" className="navbar__dropdown-item">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Dashboard
                        </Link>
                        <Link to="/seller/courses" className="navbar__dropdown-item">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          My Courses
                        </Link>
                        <Link to="/seller/requests" className="navbar__dropdown-item">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Access Requests
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/dashboard" className="navbar__dropdown-item">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M2 13l10-11 10 11v9a2 2 0 01-2 2H4a2 2 0 01-2-2v-9z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          My Learning
                        </Link>
                        <Link to="/my-courses" className="navbar__dropdown-item">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          My Courses
                        </Link>
                      </>
                    )}

                    <div className="navbar__dropdown-divider" />

                    <button className="navbar__dropdown-item navbar__dropdown-logout" onClick={handleLogout}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost navbar__login">Log in</Link>
                <Link to="/signup" className="btn btn-primary">Sign up</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile */}
      {menuOpen && <div className="navbar__overlay" onClick={() => setMenuOpen(false)} />}

      <div className={`navbar__mobile ${menuOpen ? 'open' : ''}`}>
        <button className="navbar__mobile-close" onClick={() => setMenuOpen(false)}>✕</button>

        <form className="navbar__mobile-search" onSubmit={(e) => { handleSearch(e); setMenuOpen(false) }}>
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search courses..."
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
            Search
          </button>
        </form>

        {user ? (
          <>
            <div className="navbar__mobile-user">
              <div className="navbar__avatar-letter" style={{ width: 44, height: 44, fontSize: '1.1rem' }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </div>
            <div className="navbar__mobile-divider" />
            {isSeller ? (
              <>
                <Link to="/seller" className="navbar__mobile-item">📊 Dashboard</Link>
                <Link to="/seller/courses" className="navbar__mobile-item">🎓 My Courses</Link>
                <Link to="/seller/requests" className="navbar__mobile-item">📋 Access Requests</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="navbar__mobile-item">🏠 My Learning</Link>
                <Link to="/my-courses" className="navbar__mobile-item">📚 My Courses</Link>
              </>
            )}
            <Link to="/courses" className="navbar__mobile-item">🌐 Browse Courses</Link>
            <div className="navbar__mobile-divider" />
            <button className="navbar__mobile-item navbar__mobile-logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </>
        ) : (
          <div className="navbar__mobile-auth">
            <Link to="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Log in</Link>
            <Link to="/signup" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Sign up</Link>
          </div>
        )}
      </div>
    </>
  )
}