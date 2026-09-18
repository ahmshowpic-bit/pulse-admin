import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// أي راوت محمي بيتلف بالمكوّن ده. لو لسه بنستنى Firebase يحدد حالة
// الدخول بنعرض شاشة تحميل بسيطة بدل ما نطرد الزائر لصفحة اللوجين غلط
// قبل ما نتأكد فعلاً إنه مش مسجل دخول.
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#05050a] text-white/40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-sm font-bold tracking-widest uppercase">جاري التحقق من الدخول...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
