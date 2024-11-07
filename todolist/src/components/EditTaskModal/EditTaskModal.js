// src/components/EditTaskModal.js
import React, { useState } from 'react';
import '../TaskModal/TaskModal.css';

function EditTaskModal({ task, onSave, onClose }) {
  // Inicializando o estado do deadline com o formato ISO
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [deadline, setDeadline] = useState(
    task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ''
  );

  const handleSave = (e) => {
    e.preventDefault();

    // Garantir que a data seja convertida corretamente ao salvar
    onSave({
      ...task,
      title,
      description,
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : null,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Editar Tarefa</h2>
        <form onSubmit={handleSave}>
          <label>Título</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          
          <label>Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          
          <label>Prioridade</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Low">Baixa</option>
            <option value="Medium">Média</option>
            <option value="High">Alta</option>
          </select>
          
          <label>Prazo</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
          
          <button type="submit">Salvar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;
