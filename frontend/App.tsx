import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';

// Pages
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Radar from './pages/Radar';
import AllSports from './pages/AllSports';
import Rankings from './pages/Rankings';
import ProtectedRoute from './components/ProtectedRoute';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

import { NotificationProvider } from './components/NotificationContext';
import AppLayout from './components/AppLayout';

/* ======================
   App Router
 ====================== */
const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppLayout>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          {/* Protected Root Feed (Instagram Style) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />

          <Route path="/feed" element={<Navigate to="/" replace />} />

          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/sports" element={<AllSports />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Other Protected Routes */}
          <Route
            path="/radar"
            element={
              <ProtectedRoute>
                <Radar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rankings"
            element={
              <ProtectedRoute>
                <Rankings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLayout>
    </NotificationProvider>
  );
};

export default App;
