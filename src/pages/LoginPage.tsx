import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // تأكد من أن دالة الدخول بجوجل مسماة loginWithGoogle أو signInWithGoogle في AuthContext لديك
  const { login, loginWithGoogle } = useAuth() as any; 
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/inbox');
    } catch (err) {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      if (loginWithGoogle) {
        await loginWithGoogle();
      } else {
        throw new Error("دالة تسجيل الدخول بجوجل غير متوفرة");
      }
      navigate('/inbox');
    } catch (err) {
      setError('فشل تسجيل الدخول بواسطة جوجل');
    }
  };

  return (
    <div className="min-h-screen bg-[#08080d] flex items-center justify-center p-4">
      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-black text-cyan-400">تسجيل الدخول</h1>
          <p className="text-white/40 text-sm">لوحة تحكم AHMED PULSE</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-white/40 mb-2 mr-2">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#08080d] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-white/40 mb-2 mr-2">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#08080d] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl transition-colors"
          >
            دخول
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-4 bg-white hover:bg-gray-200 text-black font-black rounded-2xl transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            تسجيل الدخول بواسطة Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
