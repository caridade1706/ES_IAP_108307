import React, { useEffect, useState, useCallback } from 'react';
import { fetchUserData, logoutUser, fetchTasks, createTask } from '../services/apiService';
import TaskModal from '../components/TaskModal/TaskModal';
import TaskList from '../components/TaskList/TaskList';
import './Dashboard.css';
import { FaSignOutAlt, FaPlusCircle } from 'react-icons/fa';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [sortOption, setSortOption] = useState('creationDate');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

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
      const filters = {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
        page,
        limit,
      };
      const response = await fetchTasks(filters);
      setTasks(response.tasks);
      setTotalPages(response.totalPages);
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

  const applyFiltersAndSorting = useCallback(() => {
    let filtered = [...tasks];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => {
        return (
          (filterStatus === 'todo' && task.status === "To Do") ||
          (filterStatus === 'inprogress' && task.status === "In Progress") ||
          (filterStatus === 'complete' && task.status === "Done")
        );
      });
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => {
        return (
          (filterPriority === 'low' && task.priority === "Low") ||
          (filterPriority === 'medium' && task.priority === "Medium") ||
          (filterPriority === 'high' && task.priority === "High")
        );
      });
    }

    filtered = filtered.sort((a, b) => {
      if (sortOption === 'creationDate') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOption === 'deadline') {
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (sortOption === 'priority') {
        const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortOption === 'completionStatus') {
        const statusOrder = { "To Do": 1, "In Progress": 2, "Done": 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });

    setFilteredTasks(filtered);
  }, [tasks, sortOption, filterStatus, filterPriority]);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [tasks, sortOption, filterStatus, filterPriority, applyFiltersAndSorting]);

  useEffect(() => {
    loadTasks();
  }, [page, filterStatus, filterPriority]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const clearFilters = () => {
    setSortOption('creationDate');
    setFilterStatus('all');
    setFilterPriority('all');
    setPage(1);
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>My To Do List</h1>
        {userData && (
          <div className="user-info">
            <p>Olá, {userData.email}</p>
            <button onClick={handleLogout} className="logout-button">
              <FaSignOutAlt /> Sair
            </button>
          </div>
        )}
      </div>

      <div className="controls">
        <div className="filter-group">
          <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
            <option value="creationDate">Data de criação</option>
            <option value="deadline">Prazo</option>
            <option value="priority">Prioridade</option>
            <option value="completionStatus">Status de conclusão</option>
          </select>

          <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
            <option value="all">Todos</option>
            <option value="todo">A fazer</option>
            <option value="inprogress">Em progresso</option>
            <option value="complete">Completo</option>
          </select>

          <select onChange={(e) => setFilterPriority(e.target.value)} value={filterPriority}>
            <option value="all">Todas</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>

          <button className="clear-filters-button" onClick={clearFilters}>
            Limpar Filtros
          </button>
        </div>

        <button className="add-task-button" onClick={() => setShowModal(true)}>
          <FaPlusCircle /> Criar Nova Tarefa
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <TaskList tasks={filteredTasks} className="task-list" />

      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Anterior
        </button>
        <span className="current-page">Página {page} de {totalPages}</span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
          Próxima
        </button>
      </div>

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
