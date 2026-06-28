import { apiCall } from './config'
import BASE_URL from './config'

export const getCoursesAPI    = (params = {}) => {
  const q = new URLSearchParams(params).toString()
  return apiCall(`/courses${q ? '?' + q : ''}`)
}
export const getMyCoursesAPI  = ()      => apiCall('/courses/seller/my')
export const createCourseAPI  = (data)  => apiCall('/courses', 'POST', data)
export const deleteCourseAPI  = (id)    => apiCall(`/courses/${id}`, 'DELETE')
export const publishCourseAPI = (id)    => apiCall(`/courses/${id}/publish`, 'PUT')

export const addSectionAPI    = (courseId, data) => apiCall(`/courses/${courseId}/sections`, 'POST', data)
export const addLessonAPI     = (sectionId, data) => apiCall(`/courses/sections/${sectionId}/lessons`, 'POST', data)
export const deleteLessonAPI  = (lessonId) => apiCall(`/courses/lessons/${lessonId}`, 'DELETE')
export const deleteSectionAPI = (sectionId) => apiCall(`/courses/sections/${sectionId}`, 'DELETE')

export const addReviewAPI     = (courseId, data) => apiCall(`/courses/${courseId}/reviews`, 'POST', data)

export const uploadThumbnailAPI = (courseId, formData) => {
  return fetch(`${BASE_URL}/courses/${courseId}/thumbnail`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  }).then(r => r.json())
}

// Remove the /api prefix from the path since VITE_API_URL already has it
export const getCourseAPI = async (id) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/courses/${id}`, {
    credentials: 'include',
  })
  return res.json()
}

export const updateCourseAPI = async (id, data) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  return res.json()
}