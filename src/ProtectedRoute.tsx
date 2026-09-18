import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC = () => {
  const { isAdmin, loading } = useAuth();

  // عرض علامة تحميل أثناء التحقق من الجلسة بدلاً من شاشة سوداء
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // إذا كان أدمن نعرض المحتوى (Outlet)، غير ذلك نعيده لصفحة الدخول
  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
