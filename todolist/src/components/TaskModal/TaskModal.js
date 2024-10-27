// src/components/TaskModal.js
import React, { useState } from 'react';
import './TaskModal.css';

function TaskModal({ onAddTask, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('TODO');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask({ title, description, priority, status, deadline });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Criar Nova Tarefa</h2>
        <form onSubmit={handleSubmit}>
          <label>Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label>Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          <label>Prioridade</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
          </select>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <label>Prazo</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <button type="submit">Adicionar Tarefa</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
