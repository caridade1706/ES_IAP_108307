// src/components/TaskModal.js
import React, { useState } from 'react';
import './TaskModal.css';

function TaskModal({ onAddTask, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ajustando a data para o formato ISO
    const formattedDeadline = new Date(deadline).toISOString();

    // Criando o JSON conforme o esperado
    onAddTask({
      title,
      description,
      priority,
      deadline: formattedDeadline,
    });

    onClose(); // Fechar o modal após a adição da tarefa
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <h2>Criar Nova Tarefa</h2>
        <form onSubmit={handleSubmit}>
          <label>Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label>Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          <label>Prioridade</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Low">Baixa</option>
            <option value="Medium">Média</option>
            <option value="High">Alta</option>
          </select>
          <label>Prazo</label>
          <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          <button type="submit">Adicionar Tarefa</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
