document.addEventListener("DOMContentLoaded", () => {
    const listaPets = document.getElementById("listaPets");
    const listaProdutos = document.getElementById("listaProdutos");

    async function carregarPets() {
        try {
            const resposta = await fetch("/pets");

            if (!resposta.ok) {
                throw new Error("Erro ao buscar pets.");
            }

            const pets = await resposta.json();

            pets.forEach(pet => {
                const card = document.createElement("div");
                card.classList.add("card");

                const nome = document.createElement("h3");
                nome.textContent = pet.nome;

                const descricao = document.createElement("p");
                descricao.textContent = pet.descricao;

                card.appendChild(nome);
                card.appendChild(descricao);

                listaPets.appendChild(card);
            });

        } catch (error) {
            console.error(error);
        }
    }

    async function carregarProdutos() {
        try {
            const resposta = await fetch("/produtos");

            if (!resposta.ok) {
                throw new Error("Erro ao buscar produtos.");
            }

            const produtos = await resposta.json();

            produtos.forEach(produto => {
                const card = document.createElement("div");
                card.classList.add("card");

                const nome = document.createElement("h3");
                nome.textContent = produto.nome;

                const descricao = document.createElement("p");
                descricao.textContent = produto.descricao;

                const preco = document.createElement("p");
                preco.textContent = "R$ " + Number(produto.preco).toFixed(2);

                card.appendChild(nome);
                card.appendChild(descricao);
                card.appendChild(preco);

                listaProdutos.appendChild(card);
            });

        } catch (error) {
            console.error(error);
        }
    }

    if (listaPets) {
        carregarPets();
    }

    if (listaProdutos) {
        carregarProdutos();
    }

});
