import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Mail, Music as MusicIcon, Settings, LogOut, Shield } from 'lucide-react';
import { auth, signOut } from './firebase';

const navItems = [
  { to: '/inbox', label: 'البريد الوارد', icon: <Mail /> },
  { to: '/music', label: 'إدارة الأغاني', icon: <MusicIcon /> },
  { to: '/pages', label: 'بناء الصفحات', icon: <Settings /> },
  { to: '/settings', label: 'إعدادات النظام', icon: <Settings /> },
];

const AdminLayout: React.FC = () => {
  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="h-screen w-screen flex bg-[#05050a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-24 md:w-64 bg-[#0c0c12] border-l border-white/5 flex flex-col p-4 md:p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
            <Shield size={22} />
          </div>
          <span className="hidden md:block font-black text-lg tracking-tight">لوحة التحكم</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-4 p-4 rounded-2xl transition-colors font-bold ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-white/40 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 p-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-colors font-black"
        >
          <LogOut size={22} /> <span className="hidden md:inline">تسجيل الخروج</span>
        </button>
      </aside>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
