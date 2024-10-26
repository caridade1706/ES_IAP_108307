// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WelcomeCard from './components/WelcomeCard/WelcomeCard';
import { fetchUserData } from './services/apiService';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await fetchUserData();
        if (userData) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.log("Usuário não autenticado");
      }
    }

    checkAuth();
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<WelcomeCard />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
