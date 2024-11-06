// src/components/TaskList.js
import React from 'react';
import { FaFlag, FaCalendarAlt } from 'react-icons/fa';
import './TaskList.css';

function TaskList({ tasks }) {
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

  return (
    <div className="task-list">
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <div key={index} className={`task-item ${getPriorityClass(task.priority)}`}>
            <div className="task-header">
              <h3>{task.title}</h3>
              <span className="task-status">{task.status}</span>
            </div>
            <p>{task.description}</p>
            <div className="task-details">
              <p className="task-priority">
                <FaFlag /> Prioridade: {task.priority}
              </p>
              <p className="task-deadline">
                <FaCalendarAlt /> Prazo: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Sem prazo"}
              </p>
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
