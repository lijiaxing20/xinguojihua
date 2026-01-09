import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // 是否需要登录，默认 true
  requireRole?: 'parent' | 'child'; // 需要的角色
}

/**
 * 受保护的路由组件
 * 用于需要登录才能访问的页面
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireRole,
}) => {
  const { isAuthenticated, userInfo, token } = useAuthStore();
  const location = useLocation();
  
  // 如果需要登录但未登录，重定向到登录页
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // 如果需要特定角色但用户角色不匹配
  if (requireRole && userInfo?.role !== requireRole) {
    // 根据用户角色重定向到对应的仪表盘
    if (userInfo?.role === 'parent') {
      return <Navigate to="/parent-dashboard" replace />;
    } else if (userInfo?.role === 'child') {
      return <Navigate to="/child-dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;

