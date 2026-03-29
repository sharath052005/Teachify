import { apiCall } from './config'

export const signupAPI  = (body) => apiCall('/auth/signup', 'POST', body)
export const loginAPI   = (body) => apiCall('/auth/login', 'POST', body)
export const logoutAPI  = ()     => apiCall('/auth/logout', 'POST')
export const getMeAPI   = ()     => apiCall('/auth/me')
export const updateProfileAPI = (data) => apiCall('/auth/profile', 'PUT', data)