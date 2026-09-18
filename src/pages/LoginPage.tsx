import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, LogIn } from 'lucide-react';
import { auth, googleProvider, ADMIN_EMAIL, signInWithPopup, signOut } from '../firebase';
import { useAuth } from '../AuthContext';

const LoginPage: React.FC = () => {
  const { isAdmin, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // لو الأدمن داخل خالص، متعرضش عليه صفحة اللوجين تاني
  if (!loading && isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    setError('');
    setBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        setError('وصول مقيد للمسؤول فقط.');
      }
    } catch (e: any) {
      console.error(e);
      setError('فشل تسجيل الدخول. تأكد من إعدادات Firebase Authentication.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#05050a] p-4">
      <div className="w-full max-w-md bg-[#0c0c12] border border-white/10 rounded-[3rem] p-10 text-center shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-8 rounded-[2rem] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Shield size={40} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">لوحة تحكم AHMED PULSE</h1>
        <p className="text-white/40 text-sm mb-10">تسجيل دخول مقيّد للمسؤول فقط</p>

        <button
          onClick={handleLogin}
          disabled={busy}
          className="w-full py-5 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl font-black text-lg shadow-lg shadow-cyan-600/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-3"
        >
          <LogIn size={22} />
          {busy ? 'جاري تسجيل الدخول...' : 'الدخول عبر Google'}
        </button>

        {error && (
          <div className="mt-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
