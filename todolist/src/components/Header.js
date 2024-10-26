import React from 'react';

function Header({ onLogin }) {
  return (
    <header>
      <h1>My Todo List</h1>
      <button onClick={onLogin}>Login with Cognito</button>
    </header>
  );
}

export default Header;
