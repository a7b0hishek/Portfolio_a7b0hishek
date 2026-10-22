import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { Accept: 'application/json' },
  timeout: 12000,
});

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) return 'Could not reach the server. Check your connection and try again.';
  if (error.response.status === 429) return 'You have sent several messages recently. Please wait a while before trying again.';
  const detail = error.response.data?.detail;
  return typeof detail === 'string' ? detail : fallback;
}

export async function getProjects(page = 1, signal) {
  const response = await apiClient.get('/projects/', { params: { page }, signal });
  return response.data;
}

export async function getFeaturedProjects(signal) {
  const response = await apiClient.get('/projects/featured/', { signal });
  return response.data;
}

export async function getProjectBySlug(slug, signal) {
  const response = await apiClient.get(`/projects/${encodeURIComponent(slug)}/`, { signal });
  return response.data;
}

export async function submitContactMessage(payload) {
  const response = await apiClient.post('/contact/', payload);
  return response.data;
}
