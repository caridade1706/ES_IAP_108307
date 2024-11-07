const API_URL = process.env.REACT_APP_BACKEND_URL;

// Função para redirecionar para o Hosted UI do Cognito (Login)
export const loginUser = () => {
  window.location.href = `${API_URL}/auth/login`;
};

// Função para redirecionar para o Hosted UI do Cognito (Signup)
export const signupUser = () => {
  window.location.href = `${API_URL}/auth/signup`;
};

let manualLogout = false;

export const logoutUser = () => {
  manualLogout = true; 
  window.location.href = `${API_URL}/auth/logout`;
};

const fetchWrapper = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    if (response.status === 401) {
      if (!manualLogout) {
        window.location.href = `${API_URL}/auth/logout`;
      }
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao processar a solicitação.");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na requisição:", error);
    throw error;
  } finally {
    manualLogout = false;
  }
};


// Função para buscar dados do usuário autenticado
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

// Função para buscar todas as tarefas do usuário logado
export async function fetchTasks({ status, priority, page, limit }) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (priority) params.append("priority", priority);
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);

  return fetchWrapper(`${API_URL}/tasks?${params.toString()}`, { method: "GET" });
}

// Função para criar uma nova tarefa com validação de data
export async function createTask(taskData) {
  // Validação de prazo antes de enviar para o backend
  const currentDate = new Date();
  const deadlineDate = new Date(taskData.deadline);
  
  if (deadlineDate <= currentDate) {
    throw new Error("A data de prazo deve ser maior que a data atual.");
  }

  return fetchWrapper(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
}

// Função para atualizar uma tarefa
export const updateTask = async (taskId, updatedTaskData) => {
  return fetchWrapper(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTaskData),
  });
};
