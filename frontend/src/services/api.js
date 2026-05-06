// const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// export const getToken = () => localStorage.getItem('authToken');

// export const setToken = (token) => {
//   if (token) {
//     localStorage.setItem('authToken', token);
//   } else {
//     localStorage.removeItem('authToken');
//   }
// };

// export const apiRequest = async (path, options = {}) => {
//   const token = getToken();
//   const headers = {
//     'Content-Type': 'application/json',
//     ...(options.headers || {})
//   };

//   if (token) {
//     headers.Authorization = `Bearer ${token}`;
//   }

//   const response = await fetch(`${API_BASE_URL}${path}`, {
//     ...options,
//     headers
//   });

//   const data = await response.json().catch(() => ({}));

//   if (!response.ok) {
//     throw new Error(data.message || 'Something went wrong');
//   }

//   return data;
// };




// api.js

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getToken = () => localStorage.getItem('authToken');

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const apiRequest = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

//  Corrected helper functions for courses
export const getCourses = () => apiRequest('/api/courses');

export const createCourse = (courseData) =>
  apiRequest('/api/courses', {
    method: 'POST',
    body: JSON.stringify(courseData)
  });

export const getCourseById = (id) => apiRequest(`/api/courses/${id}`);

export const updateCourse = (id, courseData) =>
  apiRequest(`/api/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(courseData)
  });

export const deleteCourse = (id) =>
  apiRequest(`/api/courses/${id}`, {
    method: 'DELETE'
  });
