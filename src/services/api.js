// src/services/api.js
import axios from 'axios';

// Cấu hình URL cơ sở cho API
const API_URL = 'http://localhost:8000';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để gắn token vào header cho mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý token hết hạn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/dang-nhap';
    }
    return Promise.reject(error);
  }
);

// Đăng nhập
export const login = async (username, password) => {
  try {
    const response = await api.post('/users/login', {
      username,
      password,
    });
    
    // Lưu token vào localStorage
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      
      // Lấy thông tin người dùng sau khi đăng nhập thành công
      const userProfile = await getUserProfile();
      return userProfile;
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// Đăng ký
export const register = async (username, password, email) => {
  try {
    const response = await api.post('/users/register', {
      username,
      password,
      email,
    });
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw error;
  }
};

// Lấy thông tin người dùng hiện tại
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/me');
    // Lưu thông tin người dùng vào localStorage
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error.response?.data || error.message);
    throw error;
  }
};

// Đăng xuất
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Kiểm tra đã đăng nhập hay chưa
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Lấy thông tin người dùng từ localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  return JSON.parse(userStr);
};

// Kiểm tra người dùng có phải admin không
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

export default api;
