// src/components/WelcomeCard/WelcomeCard.js
import React from 'react';
import { loginUser, signupUser } from '../../services/apiService';
import './WelcomeCard.css';

function WelcomeCard() {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h2>Bem-vindo ao My Todo List</h2>
        <p>Organize suas tarefas e mantenha-se produtivo!</p>
        <div className="buttons">
          <button onClick={loginUser}>Login</button>
          <button onClick={signupUser}>Registrar-se</button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeCard;
