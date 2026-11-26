import { createContext, useContext, useState } from "react";
import { api, getToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  async function login(email, senha) {
    const dados = await api("/usuario/login", { method: "POST", body: { email, senha } });
    localStorage.setItem("token", dados.token);
    localStorage.setItem("usuario", JSON.stringify(dados.usuario));
    setUsuario(dados.usuario);
    return dados.usuario;
  }

  async function cadastrar(nome, email, senha, cpf) {
    await api("/usuario", { method: "POST", body: { nome, email, senha, cpf } });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  const autenticado = Boolean(getToken() && usuario);

  return (
    <AuthContext.Provider value={{ usuario, autenticado, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}