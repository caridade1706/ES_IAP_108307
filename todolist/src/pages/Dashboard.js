// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { fetchUserData, logoutUser } from '../services/apiService';
import TaskList from '../components/TaskList/TaskList';
import TaskModal from '../components/TaskModal/TaskModal';
import './Dashboard.css';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]); // Estado para as tarefas
  const [showModal, setShowModal] = useState(false); // Controle do modal

  useEffect(() => {
    async function getUserData() {
      try {
        const data = await fetchUserData();
        setUserData(data);
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

  const handleAddTask = (task) => {
    setTasks([...tasks, task]);
    setShowModal(false);
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h2>Bem-vindo, {userData ? userData.email : "Carregando..."}</h2>
        <button className="logout-btn" onClick={handleLogout}>Sair</button>
      </div>
      
      <h1>Suas Tarefas</h1>
      <button className="add-task-btn" onClick={() => setShowModal(true)}>Criar Nova Tarefa</button>

      {/* Exibição da lista de tarefas */}
      <TaskList tasks={tasks} />

      {/* Modal para criar nova tarefa */}
      {showModal && <TaskModal onAddTask={handleAddTask} onClose={() => setShowModal(false)} />}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Dashboard;
