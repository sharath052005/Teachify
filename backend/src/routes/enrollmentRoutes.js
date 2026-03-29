const express = require('express')
const router  = express.Router()
const { protect, restrictTo } = require('../middleware/authMiddleware')
const {
  requestEnrollment,
  getMyEnrollments,
  checkEnrollment,
  getSellerRequests,
  respondEnrollment,
  getProgress,
  markLesson,
} = require('../controllers/enrollmentController')

// Buyer
router.post('/request/:courseId',  protect, restrictTo('buyer'), requestEnrollment)
router.get('/my',                  protect, restrictTo('buyer'), getMyEnrollments)
router.get('/check/:courseId',     protect, checkEnrollment)
router.get('/progress/:courseId',  protect, restrictTo('buyer'), getProgress)
router.post('/progress/lesson/:lessonId', protect, restrictTo('buyer'), markLesson)

// Seller
router.get('/seller/requests',    protect, restrictTo('seller'), getSellerRequests)
router.put('/:id/respond',        protect, restrictTo('seller'), respondEnrollment)

module.exports = router