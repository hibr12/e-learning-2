const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

// ✅ Corrected helper functions
export const getCourses = () => apiRequest('/courses');

export const createCourse = (courseData) =>
  apiRequest('/courses', {
    method: 'POST',
    body: JSON.stringify(courseData)
  });

export const getCourseById = (id) => apiRequest(`/courses/${id}`);

export const updateCourse = (id, courseData) =>
  apiRequest(`/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(courseData)
  });

export const deleteCourse = (id) =>
  apiRequest(`/courses/${id}`, {
    method: 'DELETE'
  });
