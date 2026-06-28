import { apiCall } from './config'

export const requestEnrollAPI   = (courseId) => apiCall(`/enrollments/request/${courseId}`, 'POST')
export const getMyEnrollmentsAPI = ()        => apiCall('/enrollments/my')
export const checkEnrollmentAPI  = (courseId) => apiCall(`/enrollments/check/${courseId}`)
export const getSellerRequestsAPI = ()       => apiCall('/enrollments/seller/requests')
export const respondEnrollmentAPI = (id, status) => apiCall(`/enrollments/${id}/respond`, 'PUT', { status })
export const getProgressAPI      = (courseId) => apiCall(`/enrollments/progress/${courseId}`)
export const markLessonAPI       = (lessonId, completed) => apiCall(`/enrollments/progress/lesson/${lessonId}`, 'POST', { completed })