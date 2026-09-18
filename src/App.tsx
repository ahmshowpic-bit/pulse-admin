import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './LoginPage';
import InboxPage from './pages/InboxPage';
import MusicPage from './pages/MusicPage';
import PagesPage from './pages/PagesPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* المسارات الإدارية المحمية */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/inbox" replace />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/pages" element={<PagesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* إعادة توجيه أي مسار غير معروف */}
          <Route path="*" element={<Navigate to="/inbox" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
