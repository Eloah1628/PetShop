
import { useEffect, useState } from "react";
import { api, fotoSrc, dataHoje } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Home() {
  const { autenticado, usuario } = useAuth();

  const [pets, setPets] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [petSelecionado, setPetSelecionado] = useState(null);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [quantidade, setQuantidade] = useState(1);

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
      await api("/Cliente_Pet", {
        method: "POST",
        body: { id_pet: idPet },
      });
  
      setMensagem("Adoção solicitada com sucesso!");
    } catch (e) {
      setErro(e.message || "Não foi possível solicitar a adoção.");
    }
  }

  function abrirProduto(produto) {
    setProdutoSelecionado(produto);
    setQuantidade(1);
    setErro("");
  }

  function adicionarCarrinho() {
    if (!produtoSelecionado) return;

    const produto = produtoSelecionado;
    const qtd = Number(quantidade);

    if (!Number.isInteger(qtd) || qtd < 1) {
      setErro("Informe uma quantidade válida.");
      return;
    }

    const existente = carrinho.find(
      (item) => item.id === produto.id
    );

    const quantidadeAtual = existente
      ? existente.quantidade
      : 0;

    const novaQuantidade = quantidadeAtual + qtd;

    if (novaQuantidade > Number(produto.quant_estoque)) {
      setErro("Quantidade maior que o estoque disponível.");
      return;
    }

    setCarrinho((atual) => {
      const itemExiste = atual.some(
        (item) => item.id === produto.id
      );

      if (itemExiste) {
        return atual.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + qtd }
            : item
        );
      }

      return [
        ...atual,
        { ...produto, quantidade: qtd },
      ];
    });

    setProdutoSelecionado(null);
    setMensagem("Produto adicionado ao carrinho!");
    setErro("");
  }

  function removerCarrinho(idProduto) {
    setCarrinho((atual) =>
      atual.filter((item) => item.id !== idProduto)
    );
  }

  function alterarQuantidade(idProduto, novaQuantidade) {
    const qtd = Number(novaQuantidade);

    const produto = produtos.find(
      (item) => item.id === idProduto
    );

    if (!produto || !Number.isInteger(qtd) || qtd < 1) {
      return;
    }

    if (qtd > Number(produto.quant_estoque)) {
      setErro("Quantidade maior que o estoque disponível.");
      return;
    }

    setErro("");

    setCarrinho((atual) =>
      atual.map((item) =>
        item.id === idProduto
          ? { ...item, quantidade: qtd }
          : item
      )
    );
  }

  const totalCarrinho = carrinho.reduce(
    (total, item) =>
      total + Number(item.preco) * item.quantidade,
    0
  );

  const quantidadeCarrinho = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  async function finalizarCompra() {
    setMensagem("");
    setErro("");

    if (carrinho.length === 0) {
      setErro("Seu carrinho está vazio.");
      return;
    }

    try {
      for (const item of carrinho) {
        await api("/Cliente_Produto", {
          method: "POST",
          body: {
            id_produto: item.id,
            quantidade: item.quantidade,
            data_compra: dataHoje(),
          },
        });
      }

      setCarrinho([]);
      setMostrarCarrinho(false);
      setMensagem("Compra realizada com sucesso!");

      try {
        const listaProdutos = await api("/produtos");
        setProdutos(listaProdutos);
      } catch (erroAtualizacao) {
        console.error("Não foi possível atualizar os produtos:", erroAtualizacao);
      }
    } catch (e) {
      setErro(e.message || "Não foi possível finalizar a compra.");
    }
  }

  return (
    <>
      <section className="hero">
        <h1>
          <strong>Bem-vindo ao PetShop Luzzie</strong>
        </h1>

        <h2>
          <b>
            O cuidado que o seu melhor amigo merece, com amor e dedicação.
          </b>
        </h2>
      </section>

      {mensagem && <div className="success-msg">{mensagem}</div>}
      {erro && <div className="error-msg">{erro}</div>}

      {autenticado && !usuario?.is_admin && (
        <div style={{ textAlign: "right", marginBottom: "20px" }}>
          <button
            className="btn"
            onClick={() => setMostrarCarrinho(true)}
          >
            🛒 Carrinho ({quantidadeCarrinho})
          </button>
        </div>
      )}

      <section>
        <h2>Pets para adoção</h2>

        {pets.length === 0 && (
          <p>Nenhum pet cadastrado ainda.</p>
        )}

        <div className="grid">
          {pets.map((pet) => (
            <div className="card" key={pet.id}>
              {fotoSrc(pet.foto_url) && (
                <img src={fotoSrc(pet.foto_url)} alt={pet.nome} />
              )}

              <h3>{pet.nome}</h3>
              <p>{pet.descricao}</p>

              <p>
                Idade: {pet.idade !== null
                  ? `${pet.idade} anos`
                  : "não informada"}
              </p>

              <p>
                Sexo: {pet.sexo?.toUpperCase() === "F"
                  ? "Fêmea"
                  : "Macho"}
              </p>

              <p>
                Estado atual: {pet.estado_atual || "não informado"}
              </p>

              {autenticado && !usuario?.is_admin && (
              <button 
                className="btn btn-small" 
                disabled={pet.disponibilidade === 'Indisponível'}
                onClick={() => setPetSelecionado(pet)}
              >
                {pet.disponibilidade === 'Indisponível' ? "Pet Indisponível" : "Ver perfil"}
              </button>
              )}

              {!autenticado && (
                <p className="aviso">Faça login para adotar.</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Produtos</h2>

        {produtos.length === 0 && (
          <p>Nenhum produto cadastrado ainda.</p>
        )}

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
                R$ {Number(produto.preco)
                  .toFixed(2)
                  .replace(".", ",")}
              </p>

              <p>Estoque: {produto.quant_estoque}</p>

              {autenticado && !usuario?.is_admin && (
                <button className = "btn btn-small"
                  disabled={Number(produto.quant_estoque) <= 0} onClick={() => abrirProduto(produto)}
                >
                  {Number(produto.quant_estoque) <= 0
                    ? "Sem estoque"
                    : "Ver produto"}
                </button>
              )}

              {!autenticado && (
                <p className="aviso">Faça login para comprar.</p>
              )}
            </div>
          ))}
        </div>
      </section>
      {petSelecionado && (
        <div
          className="perfil-overlay"
          onClick={() => setPetSelecionado(null)}
        >
          <div
            className="perfil-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="perfil-fechar"
              onClick={() => setPetSelecionado(null)}
            >
              ✕
            </button>

            {fotoSrc(petSelecionado.foto_url) && (
              <img
                src={fotoSrc(petSelecionado.foto_url)}
                alt={petSelecionado.nome}
              />
            )}

            <h2>{petSelecionado.nome}</h2>
            <p>{petSelecionado.descricao}</p>
            <p>Idade: {petSelecionado.idade ?? "Não informada"}</p>
            <p>Sexo: {petSelecionado.sexo || "Não informado"}</p>
            <p>Estado: {petSelecionado.estado_atual || "Não informado"}</p>

            <p>Estado: {petSelecionado.estado_atual || "Não informado"}</p>
            <p>Status: <strong>{petSelecionado.disponibilidade || "Disponível"}</strong></p>

            <button
              className="btn"
              disabled={petSelecionado.disponibilidade === 'Indisponível'}
              onClick={() => adotar(petSelecionado.id)}
            >
              {petSelecionado.disponibilidade === 'Indisponível' ? "Indisponível para adoção" : "Quero adotar"}
</button>
          </div>
        </div>
      )}

      {produtoSelecionado && (
        <div className="perfil-overlay" onClick={() => setProdutoSelecionado(null)}>
          <div className="perfil-card" onClick={(e) => e.stopPropagation()} >
            <button className="perfil-fechar" onClick={() => setProdutoSelecionado(null)}>
              ✕
            </button>
            
            {fotoSrc(produtoSelecionado.foto_url) && (
              <img src={fotoSrc(produtoSelecionado.foto_url)} alt={produtoSelecionado.nome}/>
            )}

            <h2>{produtoSelecionado.nome}</h2>
            <p>{produtoSelecionado.descricao}</p>

            <p className="preco">
              R$ {Number(produtoSelecionado.preco)
                .toFixed(2)
                .replace(".", ",")}
            </p>

            <p>Estoque: {produtoSelecionado.quant_estoque}</p>

            <label>Quantidade:</label>

            <input
              type="number"
              min="1"
              max={produtoSelecionado.quant_estoque}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />

            <button
              className="btn"
              onClick={adicionarCarrinho}
            >
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      )}

      {mostrarCarrinho && (
        <div
          className="perfil-overlay"
          onClick={() => setMostrarCarrinho(false)}
        >
          <div
            className="perfil-card carrinho-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="perfil-fechar"
              onClick={() => setMostrarCarrinho(false)}
            >
              ✕
            </button>

            <h2>Meu carrinho 🛒</h2>

            {carrinho.length === 0 && (
              <p>Seu carrinho está vazio.</p>
            )}

            {carrinho.map((item) => (
              <div className="item-carrinho" key={item.id}>
                <h3>{item.nome}</h3>

                <p>
                  R$ {Number(item.preco)
                    .toFixed(2)
                    .replace(".", ",")}
                </p>

                <label>Quantidade:</label>

                <input type = "number" min="1" max={item.quant_estoque} value={item.quantidade} onChange={(e) => alterarQuantidade(item.id, e.target.value)}/>

                <button className = "btn btn-small" onClick={() => removerCarrinho(item.id)}>
                  Remover
                </button>
              </div>
            ))}

            <h3>Total: R$ {totalCarrinho.toFixed(2).replace(".", ",")}</h3>

            {carrinho.length > 0 && (
              <button className = "btn" type = "button" onClick={finalizarCompra}>
                Finalizar compra
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
