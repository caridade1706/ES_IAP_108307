const API_URL = process.env.REACT_APP_BACKEND_URL;

// Função para redirecionar para o Hosted UI do Cognito (Login)
export const loginUser = () => {
  window.location.href = `${API_URL}/auth/login`;
};

// Função para redirecionar para o Hosted UI do Cognito (Signup)
export const signupUser = () => {
  window.location.href = `${API_URL}/auth/signup`;
};

// Função para logout do usuário
export const logoutUser = async () => {
  window.location.href = `${API_URL}/auth/logout`;
};

// Função genérica para chamadas de API com tratamento de erros de autenticação
const fetchWrapper = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Inclui cookies na solicitação
    });

    if (response.status === 401) {
      alert("Sessão expirada. Redirecionando para o login.");
      logoutUser(); // Redireciona o usuário para o login se o token expirar
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
  }
};

// Função para buscar dados do usuário autenticado
export async function fetchUserData() {
  return fetchWrapper(`${API_URL}/auth/me`, { method: "GET" });
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
