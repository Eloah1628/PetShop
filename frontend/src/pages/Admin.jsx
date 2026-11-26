import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Admin() {
  const { usuario, autenticado } = useAuth();
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function enviarForm(e, rota) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    const form = e.target;
    const formData = new FormData(form);

    try {
      const dados = await api(rota, { method: "POST", formData });
      setMensagem("Cadastrado com sucesso (ID " + dados.id + ").");
      form.reset();
    } catch (e2) {
      setErro(e2.message);
    }
  }

  if (!autenticado) {
    return (
      <>
        <div className="error-msg">Você precisa estar logado para acessar esta página.</div>
        <Link to="/login" className="btn">Ir para o login</Link>
      </>
    );
  }

  if (!usuario.is_admin) {
    return (
      <div className="error-msg">
        Acesso restrito a administradores. Faça login com uma conta de admin.
      </div>
    );
  }

  return (
    <>
      <section className="hero">
        <h1>Painel de administração</h1>
      </section>

      {mensagem && <div className="success-msg">{mensagem}</div>}
      {erro && <div className="error-msg">{erro}</div>}

      <form className="form-admin" onSubmit={(e) => enviarForm(e, "/pet")}>
        <h3>Cadastrar pet</h3>
        <div className="input-group">
          <label>Nome</label>
          <input type="text" name="nome" required />
        </div>
        <div className="input-group">
          <label>Idade</label>
          <input type="number" name="idade" min="0" />
        </div>
        <div className="input-group">
          <label>Sexo</label>
          <select name="sexo" required defaultValue="M">
            <option value="M">Macho</option>
            <option value="F">Fêmea</option>
          </select>
        </div>
        <div className="input-group">
          <label>Descrição</label>
          <input type="text" name="descricao" required />
        </div>
        <div className="input-group">
          <label>Histórico veterinário</label>
          <input type="text" name="historico_vet" />
        </div>
        <div className="input-group">
          <label>Estado atual</label>
          <input type="text" name="estado_atual" />
        </div>
        <div className="input-group">
          <label>Foto</label>
          <input type="file" name="foto" accept="image/*" />
        </div>
        <button type="submit" className="btn btn-small">Cadastrar pet</button>
      </form>

      <form className="form-admin" onSubmit={(e) => enviarForm(e, "/produto")}>
        <h3>Cadastrar produto</h3>
        <div className="input-group">
          <label>Nome</label>
          <input type="text" name="nome" required />
        </div>
        <div className="input-group">
          <label>Descrição</label>
          <input type="text" name="descricao" required />
        </div>
        <div className="input-group">
          <label>Preço (R$)</label>
          <input type="number" name="preco" step="0.01" min="0.01" required />
        </div>
        <div className="input-group">
          <label>Quantidade em estoque</label>
          <input type="number" name="quant_estoque" min="1" required />
        </div>
        <div className="input-group">
          <label>Foto</label>
          <input type="file" name="foto" accept="image/*" />
        </div>
        <button type="submit" className="btn btn-small">Cadastrar produto</button>
      </form>

      <form
        className="form-admin"
        onSubmit={async (e) => {
          e.preventDefault();
          setMensagem("");
          setErro("");
          const form = e.target;
          try {
            const dados = await api("/veterinario", {
              method: "POST",
              body: {
                nome: form.nome.value,
                email: form.email.value || null,
                telefone: form.telefone.value || null,
                crmv: form.crmv.value || null,
                data_nasc: form.data_nasc.value,
                especializacao: form.especializacao.value || null,
              },
            });
            setMensagem("Veterinário cadastrado com sucesso (ID " + dados.id + ").");
            form.reset();
          } catch (e2) {
            setErro(e2.message);
          }
        }}
      >
        <h3>Cadastrar veterinário</h3>
        <div className="input-group">
          <label>Nome</label>
          <input type="text" name="nome" required />
        </div>
        <div className="input-group">
          <label>Data de nascimento</label>
          <input type="date" name="data_nasc" required />
        </div>
        <div className="input-group">
          <label>E-mail</label>
          <input type="email" name="email" />
        </div>
        <div className="input-group">
          <label>Telefone</label>
          <input type="text" name="telefone" />
        </div>
        <div className="input-group">
          <label>CRMV</label>
          <input type="text" name="crmv" />
        </div>
        <div className="input-group">
          <label>Especialização</label>
          <input type="text" name="especializacao" />
        </div>
        <button type="submit" className="btn btn-small">Cadastrar veterinário</button>
      </form>
    </>
  );
}