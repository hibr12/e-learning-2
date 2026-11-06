const configuredApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, '');
const API_BASE_URL = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

const TOKEN_KEY = 'api_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch (error) {
    console.error('Unable to read the authentication token from browser storage', error);
    return '';
  }
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
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
