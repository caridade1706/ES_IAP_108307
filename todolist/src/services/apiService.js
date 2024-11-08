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

    if (response.status === 401 && !manualLogout) {
      window.location.href = `${API_URL}/auth/logout`;
      throw new Error("Unauthorized");
    }
    if (!response.ok) throw new Error("Erro ao buscar tarefas");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
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

    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(taskData),
    });

    if (response.status === 401 && !manualLogout) {
      window.location.href = `${API_URL}/auth/logout`;
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao criar a tarefa");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    throw error;
  }
}

// Função para atualizar uma tarefa
export const updateTask = async (taskId, updatedTaskData) => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
      body: JSON.stringify(updatedTaskData),
    });

    if (response.status === 401 && !manualLogout) {
      window.location.href = `${API_URL}/auth/logout`;
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao atualizar a tarefa");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro na atualização da tarefa:", error);
    throw error;
  }
};

// Função para deletar uma tarefa
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: "include",
    });

    if (response.status === 401 && !manualLogout) {
      window.location.href = `${API_URL}/auth/logout`;
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao deletar a tarefa");
    }
    return response;
  } catch (error) {
    console.error("Erro ao deletar a tarefa:", error);
    throw error;
  }
};
