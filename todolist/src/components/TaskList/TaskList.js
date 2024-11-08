import React from 'react';
import { FaFlag, FaCalendarAlt, FaPencilAlt, FaClock, FaTrash } from 'react-icons/fa';
import './TaskList.css';

function TaskList({ tasks, onEditClick, onUpdateStatus, onDeleteClick }) {
  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'high-priority';
      case 'medium':
        return 'medium-priority';
      case 'low':
        return 'low-priority';
      default:
        return '';
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    onUpdateStatus(taskId, newStatus); // Chama a função para atualizar o status no backend
  };

  return (
    <div className="task-list">
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <div key={index} className={`task-item ${getPriorityClass(task.priority)}`}>
            <div className="task-header">
              <h3>{task.title}</h3>
              <div className="task-status">
                <select
                  className={`task-status-dropdown ${
                    task.status === "ToDo" ? "task-status-todo" : 
                    task.status === "In_Progress" ? "task-status-in-progress" : 
                    "task-status-done"
                  }`}
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="ToDo">A fazer</option>
                  <option value="In_Progress">Em progresso</option>
                  <option value="Done">Completo</option>
                </select>
              </div>
            </div>
            <p>{task.description}</p>
            <div className="task-details">
              <p className="task-priority">
                <FaFlag /> Prioridade: {task.priority}
              </p>
              <p className="task-deadline">
                <FaCalendarAlt /> Prazo: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Sem prazo"}
              </p>
              <p className="task-last-update">
                <FaClock /> Última atualização: {task.last_updated ? new Date(task.last_updated).toLocaleString() : "N/A"}
              </p>
              <div className="task-icons">
                <FaPencilAlt
                  className="edit-icon"
                  onClick={() => onEditClick(task)}
                  title="Editar Tarefa"
                />
                  
                <FaTrash 
                  className="delete-icon" 
                  onClick={() => onDeleteClick(task.id)} 
                  title="Excluir Tarefa" 
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>Nenhuma tarefa criada ainda.</p>
      )}
    </div>
  );
}

export default TaskList;
