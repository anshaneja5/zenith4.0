const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    signup: `${API_BASE_URL}/auth/signup`,
  },
  documents: {
    list: '/api/documents',
    create: '/api/documents',
    get: (id) => `/api/documents/${id}`,
    update: (id) => `/api/documents/${id}`,
    delete: (id) => `/api/documents/${id}`,
    review: (id) => `/api/documents/${id}/review`,
    share: (id) => `/api/documents/${id}/share`,
  },
  templates: {
    list: '/api/templates',
    create: '/api/templates',
    get: (id) => `/api/templates/${id}`,
    update: (id) => `/api/templates/${id}`,
    delete: (id) => `/api/templates/${id}`,
  },
  legal: {
    chat: '/api/legal/chat',
    sessions: '/api/legal/sessions',
    session: (id) => `/api/legal/sessions/${id}`,
  },
  files: {
    upload: `${API_BASE_URL}/files/upload`,
  },
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
};

export default API_ENDPOINTS; 