import { Link } from 'react-router-dom'
import '../styles/coursecard.css'

export default function CourseCard({ course, size = 'md' }) {
  const formatPrice = (p) => p === 0 ? 'Free' : `₹${Number(p).toLocaleString('en-IN')}`
  const renderStars = (rating) => '★'.repeat(Math.floor(rating || 0)) + '☆'.repeat(5 - Math.floor(rating || 0))
  const courseId = course.id

  return (
    <Link
      to={`/courses/${courseId}`}
      className={`course-card course-card--${size}`}
    >
      {/* Thumbnail */}
      <div className="course-card__thumb">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} loading="lazy" />
        ) : (
          <div className="course-card__thumb-placeholder">
            <span>🎓</span>
          </div>
        )}
        {course.level && (
          <span className="course-card__level">{course.level}</span>
        )}
      </div>

      {/* Body */}
      <div className="course-card__body">
        <h3 className="course-card__title">{course.title}</h3>

        {course.instructor && (
          <p className="course-card__instructor">
            {course.instructor || course.seller_name}
          </p>
        )}

        {(course.rating > 0 || course.review_count > 0) && (
          <div className="course-card__rating">
            <span className="course-card__stars">{renderStars(course.rating)}</span>
            <span className="course-card__rating-val">{Number(course.rating || 0).toFixed(1)}</span>
            <span className="course-card__rating-count">
              ({Number(course.review_count || 0).toLocaleString()})
            </span>
          </div>
        )}

        <div className="course-card__meta">
          {course.total_lessons > 0 && (
            <span>{course.total_lessons} lessons</span>
          )}
          {course.total_hours > 0 && (
            <span>{course.total_hours}h total</span>
          )}
        </div>

        <div className="course-card__footer">
          <span className="course-card__price">{formatPrice(course.price)}</span>
          {course.student_count > 0 && (
            <span className="course-card__students">
              {Number(course.student_count).toLocaleString()} students
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}