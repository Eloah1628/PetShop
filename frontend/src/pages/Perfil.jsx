import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fotoSrc } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Perfil() {
  const { usuario, autenticado } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [pets, setPets] = useState([]);
  const [compras, setCompras] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [idVet, setIdVet] = useState("");
  const [dataConsulta, setDataConsulta] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregarTudo() {
    try {
      const [dadosPerfil, meusPets, minhasCompras, minhasConsultas, listaVets] = await Promise.all([
        api("/usuario/" + usuario.id),
        api("/Cliente_Pet"),
        api("/Cliente_Produto"),
        api("/Cliente_Veterinario"),
        api("/veterinarios"),
      ]);
      setPerfil(dadosPerfil);
      setPets(meusPets);
      setCompras(minhasCompras);
      setConsultas(minhasConsultas);
      setVeterinarios(listaVets);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    if (autenticado) carregarTudo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado]);

  async function enviarFoto(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    const arquivo = e.target.foto.files[0];
    if (!arquivo) {
      setErro("Selecione uma imagem primeiro.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("foto", arquivo);
      await api("/usuario/" + usuario.id + "/foto", { method: "POST", formData });
      setMensagem("Foto atualizada com sucesso.");
      carregarTudo();
    } catch (e2) {
      setErro(e2.message);
    }
  }

  async function agendar(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (!idVet || !dataConsulta) {
      setErro("Escolha o veterinário e a data da consulta.");
      return;
    }

    try {
      const dados = await api("/Cliente_Veterinario", {
        method: "POST",
        body: { id_veterinario: Number(idVet), data_consulta: dataConsulta },
      });
      setMensagem(dados.msg);
      setIdVet("");
      setDataConsulta("");
      carregarTudo();
    } catch (e2) {
      setErro(e2.message);
    }
  }

  async function cancelarConsulta(idVeterinario, data) {
    try {
      await api("/Cliente_Veterinario/" + idVeterinario + "/" + data, { method: "DELETE" });
      carregarTudo();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (!autenticado) {
    return (
      <>
        <div className="error-msg">Você precisa estar logado para ver esta página.</div>
        <Link to="/login" className="btn">Ir para o login</Link>
      </>
    );
  }

  return (
    <>
      <section className="hero">
        <h1>Olá, {perfil?.nome || usuario.nome}</h1>
      </section>

      {mensagem && <div className="success-msg">{mensagem}</div>}
      {erro && <div className="error-msg">{erro}</div>}

      <section>
        <h2>Meus dados</h2>
        <div className="card">
          {fotoSrc(perfil?.foto_url) && (
            <img src={fotoSrc(perfil.foto_url)} alt="Foto de perfil" />
          )}
          <p><strong>Nome:</strong> {perfil?.nome}</p>
          <p><strong>E-mail:</strong> {perfil?.email}</p>
          <p><strong>CPF:</strong> {perfil?.cpf}</p>
          <p><strong>Tipo de conta:</strong> {perfil?.is_admin ? "Administrador" : "Usuário comum"}</p>

          <form onSubmit={enviarFoto} style={{ marginTop: "12px" }}>
            <div className="input-group">
              <label htmlFor="foto">Alterar foto de perfil</label>
              <input type="file" id="foto" name="foto" accept="image/*" />
            </div>
            <button type="submit" className="btn btn-small">Enviar foto</button>
          </form>
        </div>
      </section>

      <section>
        <h2>Meus pets</h2>
        {pets.length === 0 && <p>Você ainda não adotou nenhum pet.</p>}
        <div className="grid">
          {pets.map((pet) => (
            <div className="card" key={pet.id_pet}>
              {fotoSrc(pet.foto_url) && <img src={fotoSrc(pet.foto_url)} alt={pet.nome} />}
              <h3>{pet.nome}</h3>
              <p>{pet.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Minhas compras</h2>
        {compras.length === 0 && <p>Você ainda não comprou nenhum produto.</p>}
        <div className="grid">
          {compras.map((c) => (
            <div className="card" key={c.id_produto + "-" + c.data_compra}>
              <h3>{c.nome}</h3>
              <p>Quantidade: {c.quantidade}</p>
              <p className="preco">R$ {Number(c.preco).toFixed(2)}</p>
              <p>Data: {c.data_compra}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Agendar consulta veterinária</h2>
        <form className="form-admin" onSubmit={agendar}>
          <div className="input-group">
            <label htmlFor="veterinario">Veterinário</label>
            <select id="veterinario" value={idVet} onChange={(e) => setIdVet(e.target.value)}>
              <option value="">Selecione um veterinário</option>
              {veterinarios.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome} — {v.especializacao}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="dataConsulta">Data da consulta</label>
            <input
              type="date"
              id="dataConsulta"
              value={dataConsulta}
              onChange={(e) => setDataConsulta(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-small">Agendar</button>
        </form>

        <h2>Minhas consultas</h2>
        {consultas.length === 0 && <p>Você não possui consultas agendadas.</p>}
        <div className="grid">
          {consultas.map((c) => (
            <div className="card" key={c.id_veterinario + "-" + c.data_consulta}>
              <h3>{c.nome}</h3>
              <p>{c.especializacao}</p>
              <p>Data: {c.data_consulta}</p>
              <button
                className="btn btn-small btn-outline"
                onClick={() => cancelarConsulta(c.id_veterinario, c.data_consulta)}
              >
                Cancelar consulta
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}