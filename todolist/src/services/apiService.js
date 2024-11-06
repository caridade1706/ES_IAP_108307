// src/services/apiService.js
const API_URL = process.env.REACT_APP_BACKEND_URL;

//Função para redirecionar para o Hosted UI do Cognito (Login)
export const loginUser = () => {
  window.location.href = `${API_URL}/auth/login`;
};

// Função para redirecionar para o Hosted UI do Cognito (signup)
export const signupUser = () => {
  window.location.href = `${API_URL}/auth/signup`;
};


// Função para buscar dados do usuário autenticado
export async function fetchUserData() {
  try {
      const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include", // Inclui cookies na solicitação
      });
      if (!response.ok) throw new Error("Failed to fetch user data");
      return await response.json();
  } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      throw error; // Repassa o erro para o componente gerenciar
  }
}

// Função para logout do usuário
export const logoutUser = async () => {
  window.location.href = `${API_URL}/auth/logout`;
};


// Função para buscar todas as tarefas do usuário logado
export async function fetchTasks({ status, priority, page, limit }) {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (priority) params.append("priority", priority);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const response = await fetch(`${API_URL}/tasks?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Erro ao buscar tarefas");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    throw error;
  }
}
// Função para criar uma nova tarefa
export async function createTask(taskData) {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Para incluir cookies de autenticação
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error("Erro ao criar a tarefa");
    return await response.json();
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    throw error;
  }
}
