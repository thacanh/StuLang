// src/pages/register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { register } from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.username, formData.password, formData.email);
      // Hiển thị thông báo thành công
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/dang-nhap');
    } catch (error) {
      if (error.response) {
        // Xử lý các loại lỗi phổ biến
        if (error.response.status === 400) {
          if (error.response.data.detail.includes('Username already registered')) {
            setError('Tên đăng nhập đã tồn tại');
          } else if (error.response.data.detail.includes('Email already registered')) {
            setError('Email đã được sử dụng');
          } else {
            setError(error.response.data.detail || 'Đăng ký thất bại');
          }
        } else {
          setError('Đăng ký thất bại. Vui lòng thử lại sau.');
        }
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!formData.password) return { level: 0, text: "" }
    
    if (formData.password.length < 6) {
      return { level: 1, text: "Yếu" }
    } else if (formData.password.length < 8) {
      return { level: 2, text: "Trung bình" }
    } else if (formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)) {
      return { level: 4, text: "Mạnh" }
    } else {
      return { level: 3, text: "Khá" }
    }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen bg-[#F5FBFF] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">StuLang</h1>
          <p className="text-gray-500">Tạo tài khoản mới</p>
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

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Tạo mật khẩu"
                required
                minLength={6}
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Độ mạnh mật khẩu: {strength.text}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      strength.level === 1 ? 'bg-red-500' : 
                      strength.level === 2 ? 'bg-yellow-500' : 
                      strength.level === 3 ? 'bg-blue-500' : 'bg-green-500'
                    }`} 
                    style={{ width: `${(strength.level * 25)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập lại mật khẩu"
                required
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="flex items-center text-green-500 mt-2">
                <CheckCircle size={16} className="mr-1" />
                <span className="text-xs">Mật khẩu khớp</span>
              </div>
            )}
            
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div className="text-red-500 text-xs mt-2">
                Mật khẩu xác nhận không khớp
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <button
              onClick={() => navigate('/dang-nhap')}
              className="text-green-600 font-medium hover:underline"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
