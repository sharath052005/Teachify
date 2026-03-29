const express = require('express')
const router  = express.Router()
const { protect, restrictTo } = require('../middleware/authMiddleware')
const { uploadThumbnail } = require('../config/cloudinary')
const {
  getCourses, getCourse, getMyCourses,
  createCourse, updateCourse, publishCourse, deleteCourse,
  addSection, deleteSection,
  addLesson, deleteLesson,
  uploadThumbnailHandler,
  addReview,
} = require('../controllers/courseController')

// Public
router.get('/',    getCourses)

// Seller
router.get('/seller/my',  protect, restrictTo('seller'), getMyCourses)
router.post('/',          protect, restrictTo('seller'), createCourse)

// Section / lesson (before /:id to avoid conflicts)
router.post('/:courseId/sections',         protect, restrictTo('seller'), addSection)
router.delete('/sections/:sectionId',      protect, restrictTo('seller'), deleteSection)
router.post('/sections/:sectionId/lessons', protect, restrictTo('seller'), addLesson)
router.delete('/lessons/:lessonId',        protect, restrictTo('seller'), deleteLesson)
router.post('/:id/thumbnail',              protect, restrictTo('seller'), uploadThumbnail.single('thumbnail'), uploadThumbnailHandler)

// Single course
router.get('/:id',         getCourse)
router.put('/:id',         protect, restrictTo('seller'), updateCourse)
router.put('/:id/publish', protect, restrictTo('seller'), publishCourse)
router.delete('/:id',      protect, restrictTo('seller'), deleteCourse)
router.post('/:courseId/reviews', protect, restrictTo('buyer'), addReview)

module.exports = router