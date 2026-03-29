import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetails from './pages/CourseDetails'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CoursePlayer from './pages/CoursePlayer'
import SellerHome from './pages/seller/SellerHome'
import SellerCourses from './pages/seller/SellerCourses'
import CreateCourse from './pages/seller/CreateCourse'
import SellerRequests from './pages/seller/SellerRequests'
import ProtectedRoute from './components/ProtectedRoute'
import useScrollToTop from './hooks/useScrollToTop'
import { useAuth } from './context/AuthContext'
import EditCourse from './pages/seller/EditCourse'

function AppContent() {
  useScrollToTop()
  const { user } = useAuth()

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/"           element={<Home />} />
          <Route path="/courses"    element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/signup"     element={<Signup />} />

          {/* Buyer protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/my-courses" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/learn/:id" element={
            <ProtectedRoute><CoursePlayer /></ProtectedRoute>
          } />

          {/* Seller protected */}
          <Route path="/seller" element={
            <ProtectedRoute sellerOnly><SellerHome /></ProtectedRoute>
          } />
          <Route path="/seller/courses" element={
            <ProtectedRoute sellerOnly><SellerCourses /></ProtectedRoute>
          } />
          <Route path="/seller/courses/create" element={
            <ProtectedRoute sellerOnly><CreateCourse /></ProtectedRoute>
          } />
          <Route path="/seller/requests" element={
            <ProtectedRoute sellerOnly><SellerRequests /></ProtectedRoute>
          } />
          <Route path="/seller/courses/:id/edit" element={
            <EditCourse />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}