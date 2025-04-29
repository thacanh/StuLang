// src/pages/login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import { login } from '../services/api';
import { useAuth } from '../config/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  
  // Lấy đường dẫn redirect sau khi đăng nhập thành công
  const from = location.state?.from?.pathname || "/";
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await login(formData.username, formData.password);
      setUser(userData);
      navigate(from, { replace: true });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại sau.');
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FBFF] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">StuLang</h1>
          <p className="text-gray-500">Đăng nhập vào tài khoản</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập mật khẩu"
                required
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <button
              onClick={() => navigate('/dang-ky')}
              className="text-green-600 font-medium hover:underline"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
