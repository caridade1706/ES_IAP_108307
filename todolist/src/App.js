// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await fetchUserData();
        if (userData) {
          setIsAuthenticated(true);
          navigate('/dashboard'); // Redireciona apenas se o usuário estiver autenticado
        }
      } catch (error) {
        console.log("Usuário não autenticado");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<WelcomeCard />} />
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
        } 
      />
    </Routes>
  );
}

export default App;
