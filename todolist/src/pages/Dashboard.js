// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { fetchUserData, logoutUser, fetchTasks, createTask } from '../services/apiService';
import TaskModal from '../components/TaskModal/TaskModal';
import TaskList from '../components/TaskList/TaskList';
import './Dashboard.css';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function getUserData() {
      try {
        const data = await fetchUserData();
        setUserData(data);
        await loadTasks();
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        setError("Não foi possível carregar os dados do usuário.");
      }
    }
    getUserData();
  }, []);

  const loadTasks = async () => {
    try {
      const tasks = await fetchTasks();
      setTasks(tasks);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      setError("Erro ao carregar tarefas.");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks([...tasks, newTask]);
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Dashboard</h1>
        {userData && (
          <div className="user-info">
            <p>Olá, {userData.email}</p>
            <button onClick={handleLogout}>Sair</button>
          </div>
        )}
      </div>
      
      <button className="add-task-button" onClick={() => setShowModal(true)}>Criar Nova Tarefa</button>

      <TaskList tasks={tasks} />

      {showModal && (
        <TaskModal
          onAddTask={handleAddTask}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
