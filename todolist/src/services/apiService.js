import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Configura uma instância do axios com os padrões
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Inclui cookies nas solicitações
});

// Redirecionamento para o Cognito (Login)
export const loginUser = () => {
  window.location.href = `${API_URL}/auth/login`;
};

// Redirecionamento para o Cognito (Signup)
export const signupUser = () => {
  window.location.href = `${API_URL}/auth/signup`;
};

let manualLogout = false;

// Logout do usuário
export const logoutUser = () => {
  manualLogout = true;
  window.location.href = `${API_URL}/auth/logout`;
};

// Função para buscar dados do usuário autenticado
export async function fetchUserData() {
  try {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    throw error;
  }
}

// Função para buscar todas as tarefas do usuário logado
export async function fetchTasks({ status, priority, page, limit }) {
  try {
    const params = { status, priority, page, limit };
    const response = await axiosInstance.get('/tasks', { params });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    handleUnauthorizedError(error);
    throw error;
  }
}

// Função para criar uma nova tarefa com validação de data
export async function createTask(taskData) {
  try {
    const currentDate = new Date();
    const deadlineDate = new Date(taskData.deadline);

    if (deadlineDate <= currentDate) {
      throw new Error("A data de prazo deve ser maior que a data atual.");
    }

    const response = await axiosInstance.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    handleUnauthorizedError(error);
    throw error;
  }
}

// Função para atualizar uma tarefa
export const updateTask = async (taskId, updatedTaskData) => {
  try {
    const response = await axiosInstance.put(`/tasks/${taskId}`, updatedTaskData);
    return response.data;
  } catch (error) {
    console.error("Erro na atualização da tarefa:", error);
    handleUnauthorizedError(error);
    throw error;
  }
};

// Função para deletar uma tarefa
export const deleteTask = async (taskId) => {
  try {
    const response = await axiosInstance.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar a tarefa:", error);
    handleUnauthorizedError(error);
    throw error;
  }
};

// Função auxiliar para tratar erros de autorização
const handleUnauthorizedError = (error) => {
  if (error.response && error.response.status === 401 && !manualLogout) {
    window.location.href = `${API_URL}/auth/logout`;
    throw new Error("Unauthorized");
  }
};
