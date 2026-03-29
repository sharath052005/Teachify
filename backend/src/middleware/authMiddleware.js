const jwt  = require('jsonwebtoken')
const pool = require('../config/db')

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, bio, headline FROM users WHERE id = ?',
      [decoded.id]
    )

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' })
    }

    req.user = rows[0]
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' })
  }
}

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied.' })
  }
  next()
}

module.exports = { protect, restrictTo }