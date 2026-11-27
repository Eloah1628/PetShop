import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fotoSrc, dataHoje } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Home() {
  const { autenticado, usuario } = useAuth();
  const [pets, setPets] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const [listaPets, listaProdutos] = await Promise.all([
          api("/pets"),
          api("/produtos"),
        ]);
        setPets(listaPets);
        setProdutos(listaProdutos);
      } catch (e) {
        setErro(e.message);
      }
    }
    carregar();
  }, []);
  
  async function adotar(idPet) {
    setMensagem("");
    setErro("");
    try {
      const dados = await api("/Cliente_Pet", { method: "POST", body: { id_pet: idPet } });
      setMensagem(dados.msg);
    } catch (e) {
      setErro(e.message);
    }
  }
  
  async function comprar(idProduto) {
    setMensagem("");
    setErro("");
    try {
      const dados = await api("/Cliente_Produto", {
        method: "POST",
        body: { id_produto: idProduto, quantidade: 1, data_compra: dataHoje() },
      });
      setMensagem(dados.msg);
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <>
      <section className="hero">
        <h1><strong>Bem-vindo ao PetShop Luzzie</strong></h1>
        <h2><b>O cuidado que o seu melhor amigo merece, com amor e dedicação.</b></h2>
      </section>

      {mensagem && <div className="success-msg">{mensagem}</div>}
      {erro && <div className="error-msg">{erro}</div>}

      <section>
        <h2>Pets para adoção</h2>
        {pets.length === 0 && <p>Nenhum pet cadastrado ainda.</p>}
        <div className="grid">
          {pets.map((pet) => (
            <div className="card" key={pet.id}>
              {fotoSrc(pet.foto_url) && <img src={fotoSrc(pet.foto_url)} alt={pet.nome} />}
              <h3>{pet.nome}</h3>
              <p>{pet.descricao}</p>
              <p>Idade: {pet.idade !== null ? pet.idade + " anos" : "não informada"}</p>
              <p>Sexo: {pet.sexo && pet.sexo.toUpperCase() === "F" ? "Fêmea" : "Macho"}</p>
              <p>Estado atual: {pet.estado_atual || "não informado"}</p>
              {autenticado && !usuario.is_admin && (
                <button className="btn btn-small" onClick={() => adotar(pet.id)}>
                  Ver perfil
                </button>
              )}
              {!autenticado && <p className="aviso">Faça login para adotar.</p>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Produtos</h2>

        {produtos.length === 0 && <p>Nenhum produto cadastrado ainda.</p>}

        <div className="grid">
          {produtos.map((produto) => (
            <div className="card" key={produto.id}>

              {produto.foto_url && (
                <img
                  src={fotoSrc(produto.foto_url)}
                  alt={produto.nome}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}

              <h3>{produto.nome}</h3>

              <p>{produto.descricao}</p>

              <p className="preco">
                R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
              </p>

              <p>Estoque: {produto.quant_estoque}</p>

              {autenticado && !usuario.is_admin && (
                <button
                  className="btn btn-small"
                  onClick={() => comprar(produto.id)}
                >
                  Comprar
                </button>
              )}

              {!autenticado && (
                <p className="aviso">Faça login para comprar.</p>
              )}

            </div>
          ))}
        </div>
      </section>
    </>
  );
}