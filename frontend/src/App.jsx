import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import DiscoveryPage from './pages/DiscoveryPage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage';
import AddressPage from './pages/AddressPage';
import LettersPage from './pages/LettersPage';
import SettingsPage from './pages/SettingsPage';

const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <div className="loading" style={{ fontSize: '20px', color: 'white' }}>{message}</div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading your account..." />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/discovery" element={<PrivateRoute><DiscoveryPage /></PrivateRoute>} />
        <Route path="/matches" element={<PrivateRoute><MatchesPage /></PrivateRoute>} />
        <Route path="/chat/:matchId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/address" element={<PrivateRoute><AddressPage /></PrivateRoute>} />
        <Route path="/letters/:matchId" element={<PrivateRoute><LettersPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
