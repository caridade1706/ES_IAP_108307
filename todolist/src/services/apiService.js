// src/services/apiService.js
const API_URL = process.env.REACT_APP_BACKEND_URL;

//Função para redirecionar para o Hosted UI do Cognito (Login)
export const loginUser = () => {
  window.location.href = `${API_URL}/auth/login`;
};

// Função para redirecionar para o Hosted UI do Cognito (signup)
export const signupUser = () => {
  window.location.href = `${API_URL}/auth/redirect`;
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
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "GET",
    credentials: "include",
  });
  if (response.ok) {
    window.location.href = "/";
  } else {
    throw new Error("Logout failed");
  }
};
