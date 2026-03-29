import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signupAPI } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import '../styles/auth.css'

export default function Signup() {
  const [searchParams]        = useSearchParams()
  const [role, setRole]       = useState(searchParams.get('role') === 'seller' ? 'seller' : 'buyer')
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const { setUser }           = useAuth()
  const navigate              = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await signupAPI({ ...form, role })
      setUser(data.user)
      navigate(role === 'seller' ? '/seller' : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page page-enter">
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>Create your account</h1>
            <p>Join Teachify for free today</p>
          </div>

          {/* Role toggle */}
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`auth-role-tab ${role === 'buyer' ? 'active' : ''}`}
              onClick={() => setRole('buyer')}
            >
               I want to learn
            </button>
            <button
              type="button"
              className={`auth-role-tab ${role === 'seller' ? 'active' : ''}`}
              onClick={() => setRole('seller')}
            >
               I want to teach
            </button>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>{role === 'seller' ? 'Your full name' : 'Full name'}</label>
              <input
                type="text"
                placeholder={role === 'seller' ? 'e.g. Rahul Sharma' : 'Your full name'}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-field">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
              />
            </div>

            <p className="auth-terms">
              By signing up, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
            </p>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading
                ? <span className="spinner spinner--sm" />
                : `Create ${role === 'seller' ? 'Instructor' : 'Learner'} Account →`
              }
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}