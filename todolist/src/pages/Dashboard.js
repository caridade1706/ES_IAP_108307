// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { fetchUserData, logoutUser } from '../services/apiService';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getUserData() {
      try {
        const data = await fetchUserData();
        setUserData(data);
        console.log("Dados do usuário:", data); // Log para verificar a resposta
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        setError("Não foi possível carregar os dados do usuário.");
      }
    }
    getUserData();
  }, []);
  
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : userData ? (
        <div>
          <p>Bem-vindo, {userData.username}</p>
          <p>Email: {userData.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Carregando dados do usuário...</p>
      )}
    </div>
  );
}

export default Dashboard;
