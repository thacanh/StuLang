// src/components/layout/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../config/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Hiển thị loading nếu đang kiểm tra xác thực
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
  }

  // Chuyển hướng về trang đăng nhập nếu chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền admin nếu cần
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Nếu đã đăng nhập và có đủ quyền, hiển thị nội dung
  return children;
};

export default ProtectedRoute;
