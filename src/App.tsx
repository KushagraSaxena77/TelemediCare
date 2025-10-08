import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './utils/i18n';
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import TeleconsultPage from './pages/TeleconsultPage';
import ChatbotPage from './pages/ChatbotPage';
import { storage } from './utils/localStorage';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Initialize language from localStorage
    const savedLanguage = storage.getLanguage();
    if (savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
    const userRole = storage.getUserRole();
    
    if (!userRole) {
      return <Navigate to="/" replace />;
    }
    
    if (role && userRole !== role) {
      return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/patient" 
            element={
              <ProtectedRoute role="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor" 
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/teleconsult"
            element={
              <ProtectedRoute>
                <TeleconsultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatbotPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;