import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, fotoSrc } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Admin() {
  const { usuario, autenticado } = useAuth();
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [pets, setPets] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);

  const [petEditando, setPetEditando] = useState(null);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [petsUsuarioSelecionado, setPetsUsuarioSelecionado] = useState([]);

  async function carregarDadosAdmin() {
    try {
      const [listaPets, listaProdutos, listaUsuarios] = await Promise.all([
        api("/pets"),
        api("/produtos"),
        api("/usuarios"),
      ]);
      setPets(listaPets);
      setProdutos(listaProdutos);
      setUsuariosList(listaUsuarios);
    } catch (e) {
      setErro("Erro ao carregar dados administrativos: " + e.message);
    }
  }

  useEffect(() => {
    if (autenticado && usuario?.is_admin) {
      carregarDadosAdmin();
    }
  }, [autenticado, usuario]);

  async function enviarForm(e, rota) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    const form = e.target;
    const formData = new FormData(form);

    try {
      const dados = await api(rota, { method: "POST", formData });
      setMensagem("Cadastrado com sucesso (ID " + (dados.id || dados.id_produto) + ").");
      form.reset();
      carregarDadosAdmin();
    } catch (e2) {
      setErro(e2.message);
    }
  }

  async function atualizarPet(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");
    try {
      await api(`/pet/${petEditando.id}`, {
        method: "PUT",
        body: petEditando,
      });
      setMensagem("Pet atualizado com sucesso!");
      setPetEditando(null);
      carregarDadosAdmin();
    } catch (e2) {
      setErro(e2.message);
    }
  }

  async function atualizarProduto(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");
    try {
      await api(`/produto/${produtoEditando.id}`, {
        method: "PUT",
        body: produtoEditando,
      });
      setMensagem("Produto atualizado com sucesso!");
      setProdutoEditando(null);
      carregarDadosAdmin();
    } catch (e2) {
      setErro(e2.message);
    }
  }

  async function verPerfilUsuario(u) {
    setUsuarioSelecionado(u);
    try {
      const petsUser = await api(`/usuario/${u.id}/pets`);
      setPetsUsuarioSelecionado(petsUser);
    } catch (e) {
      setPetsUsuarioSelecionado([]);
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
        <h1>Painel de Administração</h1>
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

      <section style={{ padding: "20px" }}>
        <h3>Gerenciar Pets Existentes</h3>
        <div className="grid">
          {pets.map((pet) => (
            <div className="card" key={pet.id}>
              {fotoSrc(pet.foto_url) && <img src={fotoSrc(pet.foto_url)} alt={pet.nome} />}
              <h4>{pet.nome}</h4>
              <p>{pet.descricao}</p>
              <button className="btn btn-small" onClick={() => setPetEditando(pet)}>
                Editar Pet
              </button>
            </div>
          ))}
        </div>
      </section>

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

      <section style={{ padding: "20px" }}>
        <h3>Gerenciar Produtos Existentes</h3>
        <div className="grid">
          {produtos.map((prod) => (
            <div className="card" key={prod.id}>
              {fotoSrc(prod.foto_url) && <img src={fotoSrc(prod.foto_url)} alt={prod.nome} />}
              <h4>{prod.nome}</h4>
              <p>R$ {Number(prod.preco).toFixed(2)} | Estoque: {prod.quant_estoque}</p>
              <button className="btn btn-small" onClick={() => setProdutoEditando(prod)}>
                Editar Produto
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "20px" }}>
        <h3>Usuários Cadastrados</h3>
        <div className="grid">
          {usuariosList.map((u) => (
            <div className="card" key={u.id}>
              <h4>{u.nome}</h4>
              <p>{u.email}</p>
              <p>CPF: {u.cpf}</p>
              <button className="btn btn-small" onClick={() => verPerfilUsuario(u)}>
                Checar Perfil e Solicitações
              </button>
            </div>
          ))}
        </div>
      </section>

      {petEditando && (
        <div className="perfil-overlay" onClick={() => setPetEditando(null)}>
          <div className="perfil-card" onClick={(e) => e.stopPropagation()}>
            <button className="perfil-fechar" onClick={() => setPetEditando(null)}>✕</button>
            <h3>Editar Pet</h3>
            <form onSubmit={atualizarPet}>
              <div className="input-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={petEditando.nome}
                  onChange={(e) => setPetEditando({ ...petEditando, nome: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Idade</label>
                <input
                  type="number"
                  value={petEditando.idade || ""}
                  onChange={(e) => setPetEditando({ ...petEditando, idade: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div className="input-group">
                <label>Sexo</label>
                <select
                  value={petEditando.sexo}
                  onChange={(e) => setPetEditando({ ...petEditando, sexo: e.target.value })}
                >
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                </select>
              </div>
              <div className="input-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={petEditando.descricao}
                  onChange={(e) => setPetEditando({ ...petEditando, descricao: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Estado Atual</label>
                <input
                  type="text"
                  value={petEditando.estado_atual || ""}
                  onChange={(e) => setPetEditando({ ...petEditando, estado_atual: e.target.value })}
                />
              </div>
              <button type="submit" className="btn">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}

      {produtoEditando && (
        <div className="perfil-overlay" onClick={() => setProdutoEditando(null)}>
          <div className="perfil-card" onClick={(e) => e.stopPropagation()}>
            <button className="perfil-fechar" onClick={() => setProdutoEditando(null)}>✕</button>
            <h3>Editar Produto</h3>
            <form onSubmit={atualizarProduto}>
              <div className="input-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={produtoEditando.nome}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, nome: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={produtoEditando.descricao}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, descricao: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={produtoEditando.preco}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, preco: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Estoque</label>
                <input
                  type="number"
                  value={produtoEditando.quant_estoque}
                  onChange={(e) => setProdutoEditando({ ...produtoEditando, quant_estoque: Number(e.target.value) })}
                  required
                />
              </div>
              <button type="submit" className="btn">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}

      {usuarioSelecionado && (
        <div className="perfil-overlay" onClick={() => setUsuarioSelecionado(null)}>
          <div className="perfil-card" onClick={(e) => e.stopPropagation()}>
            <button className="perfil-fechar" onClick={() => setUsuarioSelecionado(null)}>✕</button>
            <h2>Perfil de {usuarioSelecionado.nome}</h2>
            <p><strong>E-mail:</strong> {usuarioSelecionado.email}</p>
            <p><strong>CPF:</strong> {usuarioSelecionado.cpf}</p>
            <p><strong>Tipo:</strong> {usuarioSelecionado.is_admin ? "Administrador" : "Usuário Comum"}</p>

            <hr style={{ margin: "15px 0" }} />
            <h3>Pets Solicitados / Adotados</h3>
            {petsUsuarioSelecionado.length === 0 ? (
              <p>Este usuário não possui solicitações de pets.</p>
            ) : (
              <div className="grid">
                {petsUsuarioSelecionado.map((p) => (
                  <div className="card" key={p.id_pet}>
                    {fotoSrc(p.foto_url) && <img src={fotoSrc(p.foto_url)} alt={p.nome} />}
                    <h4>{p.nome}</h4>
                    <p>{p.descricao}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}