import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import InboxPage from './pages/InboxPage';
import MusicPage from './pages/MusicPage';
import PagesPage from './pages/PagesPage';
import SettingsPage from './pages/SettingsPage';

/* Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ: ØªÙ… Ø­Ø°Ù PlaceholderPage Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹
   ÙˆØ§Ø³ØªØ¨Ø¯Ø§Ù„Ù‡ Ø¨Ø§Ù„ØµÙØ­Ø§Øª Ø§Ù„ÙØ¹Ù„ÙŠØ© Ø§Ù„Ù…Ù†Ù‚ÙˆÙ„Ø© Ù…Ù† AdminModal Ø§Ù„Ù‚Ø¯ÙŠÙ…. */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* ÙƒÙ„ Ø§Ù„Ù…Ø³Ø§Ø±Ø§Øª Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© Ù…Ø­Ù…ÙŠØ© ÙˆÙ…ØºÙ„Ù‘ÙØ© Ø¨Ù€ AdminLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/inbox" replace />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/pages" element={<PagesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Ø£ÙŠ Ù…Ø³Ø§Ø± ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ ÙŠÙØ¹Ø§Ø¯ ØªÙˆØ¬ÙŠÙ‡Ù‡ */}
          <Route path="*" element={<Navigate to="/inbox" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
