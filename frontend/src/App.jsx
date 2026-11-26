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
        <a className="navbar-brand" href="/">
         <img src="https://images.openai.com/static-rsc-4/SoYiGBGnGx3lu4W9MriTqE1-C61o4ovV4q8--MwzsEPSHgvPLgEpMZGtp6Q0sdsn8hoLGDg_qeZZuroOq_840WjsSomBH8QsVXDLwiwhoGDBr5hBvxPkPLaWsEs1movaP7xVZ3NqDJcnUzlDbkYz-o_P9cIqGsuhTNAOHqUu7VhzxhJ7LMV0fOfa38oLEqnf?purpose=fullsize" alt="Logo PetShop Luzzie" />
        </a>

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
        <div>
            <div class="row">
                <div class="col-md-6">
                    <h5>Resgate e Adoção</h5>
                    <p>Encontre o companheiro perfeito e ajude pets a terem um lar cheio de amor.</p>
                </div>
                <div class="col-md-3">
                    <h6>Contato</h6>
                    <p>
                        Telefone: (11) 4002-8922
                        <br></br>
                        E-mail: contato@amigopet.org.br
                    </p>
                </div>
                <div class="col-md-3">
                    <h6>Endereço</h6>
                    <p>
                        Rua dos Pets, 123 - Centro
                        <br></br>
                        São Paulo - SP
                        <br></br>
                        Seg. a sáb., das 9h às 18h
                    </p>
                </div>
            </div>
        </div>
    </footer>
    </>
  );
}
