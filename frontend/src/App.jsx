import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import Perfil from "./pages/Perfil.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  const { usuario, autenticado, logout } = useAuth();
  const navegar = useNavigate();

  function sair() {
    logout();
    navegar("/");
  }

  return (
    <>
      <header>
        <Link to="/" className="logo">PetShop Luzzie</Link>
        <nav>
          <Link to="/">Início</Link>
          {autenticado && <Link to="/perfil">Meu Perfil</Link>}
          {autenticado && usuario.is_admin && <Link to="/admin">Administração</Link>}
          {!autenticado && <Link to="/login">Login</Link>}
          {!autenticado && <Link to="/cadastro">Cadastro</Link>}
          {autenticado && <button onClick={sair} className="btn-sair">Sair</button>}
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <footer>
        <p>2026 PetShop Luzzie. Todos os direitos reservados.</p>
      </footer>
    </>
  );
}