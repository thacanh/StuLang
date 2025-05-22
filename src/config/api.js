import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',  // URL của backend FastAPI
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Thêm interceptor để xử lý response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xóa token nếu hết hạn
      localStorage.removeItem('token');
      // Chuyển hướng về trang login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
    // Authentication
    REGISTER: `${API_BASE_URL}/register`,
    LOGIN: `${API_BASE_URL}/token`,
    GET_CURRENT_USER: `${API_BASE_URL}/users/me`,

    // Vocabulary
    GET_VOCABULARY: `${API_BASE_URL}/vocabulary`,
    ADD_VOCABULARY: `${API_BASE_URL}/vocabulary`,

    // Learning Cycle
    CREATE_CYCLE: `${API_BASE_URL}/cycles`,
    GET_CURRENT_CYCLE: `${API_BASE_URL}/cycles/current`,
    ADD_VOCAB_TO_CYCLE: `${API_BASE_URL}/cycles/vocabulary`,
    UPDATE_VOCAB_STATUS: (wordId) => `${API_BASE_URL}/cycles/vocabulary/${wordId}`,

    // Chat
    CHAT: `${API_BASE_URL}/chat`,
}; 