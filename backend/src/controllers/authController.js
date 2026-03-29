const pool         = require('../config/db')
const bcrypt       = require('bcryptjs')
const generateToken = require('../utils/generateToken')

const signup = async (req, res) => {
  try {
    const { name, email, password, role = 'buyer' } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required.' })
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' })
    }

    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be buyer or seller.' })
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
    }

    const hashed = await bcrypt.hash(password, 12)

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role]
    )

    generateToken(res, result.insertId)

    return res.status(201).json({
      success: true,
      user: { id: result.insertId, name, email, role, avatar: null }
    })
  } catch (err) {
    console.error('Signup error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' })
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    generateToken(res, user.id)

    return res.status(200).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' })
  return res.status(200).json({ success: true, message: 'Logged out.' })
}

const getMe = (req, res) => {
  return res.status(200).json({ success: true, user: req.user })
}

const updateProfile = async (req, res) => {
  try {
    const { name, bio, headline } = req.body
    await pool.query(
      'UPDATE users SET name = ?, bio = ?, headline = ? WHERE id = ?',
      [name, bio, headline, req.user.id]
    )
    return res.status(200).json({ success: true, message: 'Profile updated.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

module.exports = { signup, login, logout, getMe, updateProfile }