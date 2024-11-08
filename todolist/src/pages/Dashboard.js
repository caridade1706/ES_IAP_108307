import React, { useEffect, useState, useCallback } from 'react';
import { fetchUserData, logoutUser, fetchTasks, createTask, updateTask , deleteTask} from '../services/apiService';
import TaskModal from '../components/TaskModal/TaskModal';
import EditTaskModal from '../components/EditTaskModal/EditTaskModal'; // Import the edit modal
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
  const [showEditModal, setShowEditModal] = useState(false); // State to control edit modal
  const [selectedTask, setSelectedTask] = useState(null); // State for the selected task to edit
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

  const mapStatusToBackend = (status) => {
    const statusMap = {
      todo: "ToDo",
      inprogress: "In_Progress",
      complete: "Done"
    };
    return statusMap[status] || status;
  };
  
  const loadTasks = async () => {
    try {
      const filters = {
        status: filterStatus !== 'all' ? mapStatusToBackend(filterStatus) : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
        page,
        limit,
      };
  
      console.log("Filtros enviados para o backend:", filters); // Debugging
  
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
  

  const handleUpdateTask = async (updatedTask) => {
    try {
      const updated = await updateTask(updatedTask.id, updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updated.id ? updated : task))
      );
      setShowEditModal(false); // Fecha o modal de edição
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId); // Exclui a tarefa no backend
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    }
  };
  

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const task = tasks.find(task => task.id === taskId);
      
      const updatedTaskData = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline,
        status: mapStatusToBackend(newStatus),  // Atualize o status
      };
      
      const updatedTask = await updateTask(taskId, updatedTaskData);
  
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
    } catch (error) {
      console.error("Erro ao atualizar o status da tarefa:", error);
    }
  };
  
  
  const openEditModal = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };



  const applyFiltersAndSorting = useCallback(() => {
    let filtered = [...tasks];
  
    if (filterStatus !== 'all') {
      const mappedStatus = mapStatusToBackend(filterStatus);
      filtered = filtered.filter(task => task.status === mappedStatus);
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

      <TaskList
        tasks={filteredTasks}
        onEditClick={openEditModal}
        onUpdateStatus={handleUpdateStatus}
        onDeleteClick={handleDeleteTask} // Passa a função de exclusão aqui
      />


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

      {showEditModal && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onSave={handleUpdateTask}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
