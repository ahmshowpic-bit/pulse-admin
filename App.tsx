import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './LoginPage';
import AdminLayout from './AdminLayout';
import PlaceholderPage from './PlaceholderPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/inbox" replace />} />
            <Route path="inbox" element={<PlaceholderPage title="صندوق الوارد" />} />
            <Route path="music" element={<PlaceholderPage title="إدارة الأغاني" />} />
            <Route path="pages" element={<PlaceholderPage title="بناء الصفحات" />} />
            <Route path="settings" element={<PlaceholderPage title="إعدادات النظام" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
