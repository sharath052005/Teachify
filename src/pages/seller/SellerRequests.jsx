import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getSellerRequestsAPI, respondEnrollmentAPI } from '../../api/enrollments'
import '../../styles/sellerrequests.css'

const STATUS_STYLES = {
  pending:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Pending' },
  approved: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', label: 'Approved' },
  rejected: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Rejected' },
}

export default function SellerRequests() {
  const { user }              = useAuth()
  const [requests, setReqs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [updating, setUpdating] = useState(null)
  const [successMsg, setSuccess] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const data = await getSellerRequestsAPI()
      setReqs(data.requests || [])
    } catch { setReqs([]) }
    finally { setLoading(false) }
  }

  const handleRespond = async (id, status) => {
    setUpdating(id)
    try {
      await respondEnrollmentAPI(id, status)
      setReqs(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      setSuccess(status === 'approved' ? '✅ Access granted!' : '❌ Request declined.')
      setTimeout(() => setSuccess(''), 3000)
    } catch { alert('Failed to update. Try again.') }
    finally { setUpdating(null) }
  }

  const filtered = requests.filter(r => filter === 'all' || r.status === filter)
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="seller-requests page-enter">
      <div className="container">

        <div className="sreq-header">
          <div>
            <h1>Access Requests</h1>
            <p>{requests.filter(r => r.status === 'pending').length} pending · {requests.length} total</p>
          </div>
        </div>

        {successMsg && <div className="toast" style={{ marginBottom: 20 }}>{successMsg}</div>}

        {/* Stats */}
        <div className="sreq-stats">
          {[
            { key: 'pending',  label: 'Pending',  color: '#d97706', bg: '#fffbeb' },
            { key: 'approved', label: 'Approved', color: '#059669', bg: '#ecfdf5' },
            { key: 'rejected', label: 'Rejected', color: '#dc2626', bg: '#fef2f2' },
          ].map(s => (
            <div
              key={s.key}
              className={`sreq-stat ${filter === s.key ? 'active' : ''}`}
              style={{ '--rc': s.color, '--rb': s.bg }}
              onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
            >
              <strong>{requests.filter(r => r.status === s.key).length}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="sreq-filters">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              className={`sreq-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span>{f === 'all' ? requests.length : requests.filter(r => r.status === f).length}</span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 200 }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="sreq-empty">
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
            <h3>{filter === 'all' ? 'No requests yet' : `No ${filter} requests`}</h3>
            <p>
              {filter === 'all'
                ? 'Students will appear here when they request access to your courses.'
                : 'Try selecting a different filter.'}
            </p>
          </div>
        ) : (
          <div className="sreq-list">
            {filtered.map(req => {
              const sc = STATUS_STYLES[req.status] || STATUS_STYLES.pending
              return (
                <div key={req.id} className="sreq-card">
                  <div className="sreq-card__left">
                    <div className="sreq-avatar">{req.buyer_name?.[0]?.toUpperCase()}</div>
                    <div className="sreq-info">
                      <h3>{req.buyer_name}</h3>
                      <p className="sreq-email">{req.buyer_email}</p>
                      <div className="sreq-course-tag">
                        📚 {req.course_title}
                      </div>
                      <span className="sreq-date">Requested {formatDate(req.requested_at)}</span>
                    </div>
                  </div>

                  <div className="sreq-card__right">
                    <div
                      className="sreq-status"
                      style={{
                        background: sc.bg,
                        color: sc.color,
                        border: `1px solid ${sc.border}`,
                      }}
                    >
                      {sc.label}
                    </div>

                    {req.status === 'pending' && (
                      <div className="sreq-actions">
                        <button
                          className="btn btn-primary sreq-btn"
                          disabled={updating === req.id}
                          onClick={() => handleRespond(req.id, 'approved')}
                        >
                          {updating === req.id
                            ? <span className="spinner spinner--sm" />
                            : '✅ Approve'
                          }
                        </button>
                        <button
                          className="btn sreq-btn sreq-reject-btn"
                          disabled={updating === req.id}
                          onClick={() => handleRespond(req.id, 'rejected')}
                        >
                          ❌ Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}