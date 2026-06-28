import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, sellerOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (sellerOnly && user.role !== 'seller') {
    return <Navigate to="/" replace />
  }

  return children
}