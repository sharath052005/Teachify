const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { signup, login, logout, getMe, updateProfile } = require('../controllers/authController')

router.post('/signup',  signup)
router.post('/login',   login)
router.post('/logout',  logout)
router.get('/me',       protect, getMe)
router.put('/profile',  protect, updateProfile)

module.exports = router