// src/components/TaskList.js
import React from 'react';
import './TaskList.css';

function TaskList({ tasks }) {
  return (
    <div className="task-list">
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <div key={index} className="task-item">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            <p>Prioridade: {task.priority}</p>
            <p>Prazo: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Sem prazo"}</p>
          </div>
        ))
      ) : (
        <p>Nenhuma tarefa criada ainda.</p>
      )}
    </div>
  );
}

export default TaskList;
