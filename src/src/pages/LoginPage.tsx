import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
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

  return (
    <div className="min-h-screen bg-[#08080d] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white/5 p-8 rounded-3xl border border-white/10 w-full max-w-md space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-cyan-400">تسجيل الدخول</h1>
          <p className="text-white/40 text-sm">لوحة تحكم AHMED PULSE</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm font-bold">
            {error}
          </div>
        )}

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
    </div>
  );
};

export default LoginPage;
