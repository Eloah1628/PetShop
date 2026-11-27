const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const db = require("../db");

const { IdChecagem } = require("../middlewares/Checagens.js");
const { requireAuth, requireAdmin } = require("../middlewares/auth.js");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
    res.status(200).json({ msg: "Bem vindo ao PetShopLuzzie!" });
});

router.get("/usuarios", requireAuth, requireAdmin, async (req, res) => {
    try {
        const ListaUsuarios = await db.query("SELECT id, nome, email, cpf, foto_url, is_admin FROM Usuarios");
        res.status(200).json(ListaUsuarios.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar usuários." });
    }
});

router.get("/usuario/:id", requireAuth, IdChecagem, async (req, res) => {
    try {
        const { id } = req.params;

        if (Number(id) !== req.userId) {
            const eu = await db.query("SELECT is_admin FROM Usuarios WHERE id = $1", [req.userId]);
            if (eu.rows.length === 0 || !eu.rows[0].is_admin) {
                return res.status(403).json({ msg: "Você só pode ver o seu próprio perfil." });
            }
        }

        const usuario = await db.query("SELECT id, nome, email, cpf, foto_url, is_admin FROM Usuarios WHERE id = $1", [id]);

        if (usuario.rows.length === 0) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        res.status(200).json(usuario.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar usuário." });
    }
});

router.post("/usuario/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) {
            return res.status(400).json({ msg: "Informe o email e a senha." });
        }

        const Perfil = await db.query("SELECT id, nome, email, senha, is_admin FROM Usuarios WHERE email = $1", [email]);

        if (Perfil.rows.length === 0) {
            return res.status(401).json({ msg: "Email ou senha incorretos." });
        }

        const usuario = Perfil.rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ msg: "Email ou senha incorretos." });
        }

        const token = jwt.sign(
            { id_usuario: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: "3h" }
        );

        res.status(200).json({
            msg: "Login realizado com sucesso!",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                is_admin: usuario.is_admin
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Não foi possível realizar o login." });
    }
});

router.post("/usuario", async (req, res) => {
    const { nome, email, senha, cpf } = req.body;

    try {
        if (!nome || !email || !senha || !cpf) {
            return res.status(400).json({ msg: "Preencha todos os campos." });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const UsuarioInscrito = await db.query(
            "INSERT INTO Usuarios (nome, email, senha, cpf) VALUES($1, $2, $3, $4) RETURNING id, nome, email, cpf",
            [nome, email, senhaHash, cpf]
        );

        res.status(201).json(UsuarioInscrito.rows[0]);
    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({ msg: "Email ou CPF já cadastrado." });
        }

        res.status(500).json({ msg: "Erro ao cadastrar usuário." });
    }
});

// Logado: upload da foto de perfil (multipart/form-data, campo "foto")
router.post("/usuario/:id/foto", requireAuth, IdChecagem, upload.single("foto"), async (req, res) => {
    try {
        const { id } = req.params;

        if (Number(id) !== req.userId) {
            return res.status(403).json({ msg: "Você só pode alterar a sua própria foto." });
        }

        if (!req.file) {
            return res.status(400).json({ msg: "Envie um arquivo de imagem no campo 'foto'." });
        }

        const foto_url = "/uploads/" + req.file.filename;

        const usuarioAtualizado = await db.query(
            "UPDATE Usuarios SET foto_url = $1 WHERE id = $2 RETURNING id, nome, email, cpf, foto_url",
            [foto_url, id]
        );

        if (usuarioAtualizado.rows.length === 0) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        res.status(200).json(usuarioAtualizado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao adicionar a foto." });
    }
});

// Admin ou o próprio usuário: ver pets de um usuário específico
router.get("/usuario/:id/pets", requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        if (Number(id) !== req.userId) {
            const eu = await db.query("SELECT is_admin FROM Usuarios WHERE id = $1", [req.userId]);
            if (eu.rows.length === 0 || !eu.rows[0].is_admin) {
                return res.status(403).json({ msg: "Acesso negado." });
            }
        }

        const resultado = await db.query(
            `SELECT cp.id_usuario, cp.id_pet, p.nome, p.idade, p.sexo, p.descricao, p.foto_url
             FROM Cliente_Pet cp JOIN Pets p ON p.id = cp.id_pet
             WHERE cp.id_usuario = $1`,
            [id]
        );

        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar pets do usuário." });
    }
});

// Logado: atualizar próprio cadastro (ou admin)
router.put("/usuario/:id", requireAuth, IdChecagem, async (req, res) => {
    const { id } = req.params;
    const { nome, email, cpf } = req.body;

    try {
        if (Number(id) !== req.userId) {
            const eu = await db.query("SELECT is_admin FROM Usuarios WHERE id = $1", [req.userId]);
            if (eu.rows.length === 0 || !eu.rows[0].is_admin) {
                return res.status(403).json({ msg: "Você só pode editar o seu próprio cadastro." });
            }
        }

        const UsuarioAtualizado = await db.query(
            "UPDATE Usuarios SET nome = $1, email = $2, cpf = $3 WHERE id = $4 RETURNING id, nome, email, cpf",
            [nome, email, cpf, id]
        );

        if (UsuarioAtualizado.rows.length === 0) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        res.status(200).json(UsuarioAtualizado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao atualizar usuário." });
    }
});

// Logado: excluir próprio cadastro (ou admin)
router.delete("/usuario/:id", requireAuth, IdChecagem, async (req, res) => {
    try {
        const { id } = req.params;

        if (Number(id) !== req.userId) {
            const eu = await db.query("SELECT is_admin FROM Usuarios WHERE id = $1", [req.userId]);
            if (eu.rows.length === 0 || !eu.rows[0].is_admin) {
                return res.status(403).json({ msg: "Você só pode excluir a sua própria conta." });
            }
        }

        const UsuarioRemovido = await db.query(
            "DELETE FROM Usuarios WHERE id = $1 RETURNING id, nome, email, cpf",
            [id]
        );

        if (UsuarioRemovido.rows.length === 0) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        res.status(200).json({ msg: "Usuário removido com sucesso.", usuario: UsuarioRemovido.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao remover usuário." });
    }
});

router.get("/pets", async (req, res) => {
    try {
        const ListaPets = await db.query("SELECT * FROM Pets");
        res.status(200).json(ListaPets.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erro ao buscar pets." });
    }
});

router.get("/pet/:id", IdChecagem, async (req, res) => {
    try {
        const { id } = req.params;
        const Pet = await db.query("SELECT * FROM Pets WHERE id = $1", [id]);

        if (Pet.rows.length === 0) {
            return res.status(404).json({ msg: "Pet não encontrado." });
        }

        res.status(200).json(Pet.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erro ao buscar pet." });
    }
});

// Admin: upload da foto do pet (campo "foto")
router.post("/pet/:id/foto", requireAuth, requireAdmin, IdChecagem, upload.single("foto"), async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ msg: "Envie um arquivo de imagem no campo 'foto'." });
        }

        const foto_url = "/uploads/" + req.file.filename;

        const petAtualizado = await db.query(
            "UPDATE Pets SET foto_url = $1 WHERE id = $2 RETURNING *",
            [foto_url, id]
        );

        if (petAtualizado.rows.length === 0) {
            return res.status(404).json({ msg: "Pet não encontrado." });
        }

        res.status(200).json(petAtualizado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao adicionar a foto." });
    }
});

const Generos = ["F", "f", "M", "m"];

// Admin: cadastrar pet (multipart: campos do pet + arquivo "foto" opcional)
router.post("/pet", requireAuth, requireAdmin, upload.single("foto"), async (req, res) => {
    const { nome, idade, sexo, descricao, historico_vet, estado_atual } = req.body;

    try {
        if (!nome || !sexo || !descricao) {
            return res.status(400).json({ msg: "Nome, sexo e descrição são obrigatórios." });
        }

        if (!Generos.includes(sexo)) {
            return res.status(400).json({ msg: "Sexo inválido." });
        }

        const idadeNum = idade === undefined || idade === null || idade === "" ? null : Number(idade);

        if (idadeNum !== null && (!Number.isInteger(idadeNum) || idadeNum < 0)) {
            return res.status(400).json({ msg: "Idade inválida." });
        }

        const foto_url = req.file ? "/uploads/" + req.file.filename : null;

        const novoPet = await db.query(
            "INSERT INTO Pets(nome, idade, sexo, descricao, historico_vet, estado_atual, foto_url) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [nome, idadeNum, sexo, descricao, historico_vet || null, estado_atual || null, foto_url]
        );

        res.status(201).json(novoPet.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erro ao cadastrar pet." });
    }
});

// Admin
router.put("/pet/:id", requireAuth, requireAdmin, IdChecagem, async (req, res) => {
    const { id } = req.params;
    const { nome, idade, sexo, descricao, historico_vet, estado_atual } = req.body;

    try {
        if (!Generos.includes(sexo)) {
            return res.status(400).json({ msg: "Sexo inválido." });
        }

        if (idade !== null && idade !== undefined && (!Number.isInteger(idade) || idade < 0)) {
            return res.status(400).json({ msg: "Idade inválida." });
        }

        const petAtualizado = await db.query(
            "UPDATE Pets SET nome = $1, idade = $2, sexo = $3, descricao = $4, historico_vet = $5, estado_atual = $6 WHERE id = $7 RETURNING *",
            [nome, idade, sexo, descricao, historico_vet, estado_atual, id]
        );

        if (petAtualizado.rows.length === 0) {
            return res.status(404).json({ msg: "Pet não encontrado." });
        }

        res.status(200).json(petAtualizado.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erro ao atualizar pet." });
    }
});

// Admin
router.delete("/pet/:id", requireAuth, requireAdmin, IdChecagem, async (req, res) => {
    const { id } = req.params;

    try {
        const petRemovido = await db.query("DELETE FROM Pets WHERE id = $1 RETURNING *", [id]);

        if (petRemovido.rows.length === 0) {
            return res.status(404).json({ msg: "Pet não encontrado." });
        }

        res.status(200).json({ msg: "Pet removido com sucesso.", pet: petRemovido.rows[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erro ao remover pet." });
    }
});

router.get("/produtos", async (req, res) => {
    try {
        const ListaProdutos = await db.query("SELECT * FROM Produtos");
        res.status(200).json(ListaProdutos.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar produtos." });
    }
});

router.get("/produto/:id", IdChecagem, async (req, res) => {
    try {
        const { id } = req.params;
        const Produto = await db.query("SELECT * FROM Produtos WHERE id = $1", [id]);

        if (Produto.rows.length === 0) {
            return res.status(404).json({ msg: "Produto não encontrado." });
        }

        res.status(200).json(Produto.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar produto." });
    }
});

// Admin: cadastrar produto (multipart: campos + arquivo "foto" opcional)
router.post("/produto", requireAuth, requireAdmin, upload.single("foto"), async (req, res) => {
    const { nome, descricao, preco, quant_estoque } = req.body;

    try {
        const precoNum = Number(preco);
        const estoqueNum = Number(quant_estoque);

        if (!nome || !descricao || !Number.isFinite(precoNum) || precoNum <= 0 ||
            !Number.isInteger(estoqueNum) || estoqueNum <= 0) {
            return res.status(400).json({ msg: "Dados do produto inválidos." });
        }

        const foto_url = req.file ? "/uploads/" + req.file.filename : null;

        const ProdutoCadastrado = await db.query(
            "INSERT INTO Produtos (nome, descricao, preco, quant_estoque, foto_url) VALUES($1, $2, $3, $4, $5) RETURNING *",
            [nome, descricao, precoNum, estoqueNum, foto_url]
        );

        res.status(201).json(ProdutoCadastrado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao cadastrar produto." });
    }
});

// Admin: upload da foto do produto (campo "foto")
router.post("/produto/:id/foto", requireAuth, requireAdmin, IdChecagem, upload.single("foto"), async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ msg: "Envie um arquivo de imagem no campo 'foto'." });
        }

        const foto_url = "/uploads/" + req.file.filename;

        const produtoAtualizado = await db.query(
            "UPDATE Produtos SET foto_url = $1 WHERE id = $2 RETURNING *",
            [foto_url, id]
        );

        if (produtoAtualizado.rows.length === 0) {
            return res.status(404).json({ msg: "Produto não encontrado." });
        }

        res.status(200).json(produtoAtualizado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao adicionar a foto." });
    }
});

// Admin
router.put("/produto/:id", requireAuth, requireAdmin, IdChecagem, async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, quant_estoque } = req.body;

    try {
        if (!nome || !descricao || typeof preco !== "number" ||
            !Number.isFinite(preco) || preco <= 0 ||
            !Number.isInteger(quant_estoque) || quant_estoque < 0) {
            return res.status(400).json({ msg: "Dados do produto inválidos." });
        }

        const ProdutoEditado = await db.query(
            "UPDATE Produtos SET nome = $1, descricao = $2, preco = $3, quant_estoque = $4 WHERE id = $5 RETURNING *",
            [nome, descricao, preco, quant_estoque, id]
        );

        if (ProdutoEditado.rows.length === 0) {
            return res.status(404).json({ msg: "Produto não encontrado." });
        }

        res.status(200).json(ProdutoEditado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao atualizar produto." });
    }
});

// Admin
router.put("/produto/:id", requireAuth, requireAdmin, IdChecagem, async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, quant_estoque } = req.body;

    try {
        const precoNum = Number(preco);
        const estoqueNum = Number(quant_estoque);

        if (!nome || !descricao || !Number.isFinite(precoNum) || precoNum <= 0 ||
            !Number.isInteger(estoqueNum) || estoqueNum < 0) {
            return res.status(400).json({ msg: "Dados do produto inválidos." });
        }

        const ProdutoEditado = await db.query(
            "UPDATE Produtos SET nome = $1, descricao = $2, preco = $3, quant_estoque = $4 WHERE id = $5 RETURNING *",
            [nome, descricao, precoNum, estoqueNum, id]
        );

        if (ProdutoEditado.rows.length === 0) {
            return res.status(404).json({ msg: "Produto não encontrado." });
        }

        res.status(200).json(ProdutoEditado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao atualizar produto." });
    }
});

router.get("/veterinarios", async (req, res) => {
    try {
        const ListaVeterinarios = await db.query("SELECT * FROM Veterinarios");
        res.status(200).json(ListaVeterinarios.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar os veterinários." });
    }
});

router.get("/veterinario/:id", IdChecagem, async (req, res) => {
    try {
        const { id } = req.params;
        const veterinario = await db.query("SELECT * FROM Veterinarios WHERE id = $1", [id]);

        if (veterinario.rows.length === 0) {
            return res.status(404).json({ msg: "Veterinário não encontrado." });
        }

        res.status(200).json(veterinario.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar o veterinário." });
    }
});

// Admin
router.post("/veterinario", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { nome, email, telefone, crmv, data_nasc, especializacao } = req.body;

        if (!nome || !data_nasc) {
            return res.status(400).json({ msg: "Nome e data de nascimento são obrigatórios." });
        }

        const novoVeterinario = await db.query(
            "INSERT INTO Veterinarios (nome, email, telefone, crmv, data_nasc, especializacao) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
            [nome, email || null, telefone || null, crmv || null, data_nasc, especializacao || null]
        );

        res.status(201).json(novoVeterinario.rows[0]);
    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({ msg: "Email ou CRMV já cadastrado." });
        }

        res.status(500).json({ msg: "Erro ao cadastrar o veterinário." });
    }
});

// Admin
router.put("/veterinario/:id", requireAuth, requireAdmin, IdChecagem, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, crmv, data_nasc, especializacao } = req.body;

        if (!nome || !data_nasc) {
            return res.status(400).json({ msg: "Nome e data de nascimento são obrigatórios." });
        }

        const veterinarioAtualizado = await db.query(
            "UPDATE Veterinarios SET nome = $1, email = $2, telefone = $3, crmv = $4, data_nasc = $5, especializacao = $6 WHERE id = $7 RETURNING *",
            [nome, email || null, telefone || null, crmv || null, data_nasc, especializacao || null, id]
        );

        if (veterinarioAtualizado.rows.length === 0) {
            return res.status(404).json({ msg: "Veterinário não encontrado." });
        }

        res.status(200).json(veterinarioAtualizado.rows[0]);
    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({ msg: "Email ou CRMV já cadastrado." });
        }

        res.status(500).json({ msg: "Erro ao atualizar o veterinário." });
    }
});

// Admin
router.delete("/veterinario/:id", requireAuth, requireAdmin, IdChecagem, async (req, res) => {
    try {
        const { id } = req.params;
        const veterinarioRemovido = await db.query("DELETE FROM Veterinarios WHERE id = $1 RETURNING *", [id]);

        if (veterinarioRemovido.rows.length === 0) {
            return res.status(404).json({ msg: "Veterinário não encontrado." });
        }

        res.status(200).json({ msg: "Veterinário removido com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao remover o veterinário." });
    }
});

// Logado: adotar/vincular um pet ao usuário logado
router.post("/Cliente_Pet", requireAuth, async (req, res) => {
    const { id_pet } = req.body;

    try {
        if (!Number.isInteger(Number(id_pet)) || Number(id_pet) <= 0) {
            return res.status(400).json({ msg: "ID do pet inválido." });
        }

        await db.query(
            "INSERT INTO Cliente_Pet(id_usuario, id_pet) VALUES($1, $2)",
            [req.userId, id_pet]
        );

        res.status(201).json({ msg: "Pet adotado com sucesso!" });
    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({ msg: "Você já solicitou este pet." });
        }

        res.status(400).json({ msg: "Não foi possível adotar o pet." });
    }
});

// Logado: meus pets
router.get("/Cliente_Pet", requireAuth, async (req, res) => {
    try {
        const resultado = await db.query(
            `SELECT cp.id_usuario, cp.id_pet, p.nome, p.idade, p.sexo, p.descricao, p.foto_url
             FROM Cliente_Pet cp JOIN Pets p ON p.id = cp.id_pet
             WHERE cp.id_usuario = $1`,
            [req.userId]
        );

        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Não foi possível buscar os seus pets." });
    }
});

// Logado: remover vínculo (devolução)
router.delete("/Cliente_Pet/:id_pet", requireAuth, async (req, res) => {
    const { id_pet } = req.params;

    try {
        const removido = await db.query(
            "DELETE FROM Cliente_Pet WHERE id_usuario = $1 AND id_pet = $2 RETURNING *",
            [req.userId, id_pet]
        );

        if (removido.rows.length === 0) {
            return res.status(404).json({ msg: "Vínculo não encontrado." });
        }

        res.status(200).json({ msg: "Pet removido com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Não foi possível remover o pet." });
    }
});

// Logado: registrar compra
router.post("/Cliente_Produto", requireAuth, async (req, res) => {
    const { id_produto, quantidade, data_compra } = req.body;

    try {
        if (!Number.isInteger(Number(id_produto)) || Number(id_produto) <= 0 ||
            !Number.isInteger(Number(quantidade)) || Number(quantidade) <= 0 ||
            !data_compra) {
            return res.status(400).json({ msg: "Dados da compra inválidos." });
        }

        const compra = await db.query("INSERT INTO Cliente_Produto (id_usuario, id_produto, quantidade, data_compra) VALUES($1, $2, $3, $4) RETURNING *", [req.userId, id_produto, quantidade, data_compra]
        );

        res.status(201).json({msg: "Compra registrada com sucesso!", compra: compra.rows[0]});

    } catch (error) {
        console.error(error);
        res.status(400).json({msg: "Não foi possível registrar a compra."});
    }
});

// Logado: minhas compras
router.get("/Cliente_Produto", requireAuth, async (req, res) => {
    try {
        const resultado = await db.query("SELECT cp.id_compra, cp.id_usuario, cp.id_produto, cp.quantidade, cp.data_compra, pr.nome, pr.preco, pr.foto_url FROM Cliente_Produto cp JOIN Produtos pr ON pr.id = cp.id_produto WHERE cp.id_usuario = $1 ORDER BY cp.data_compra DESC", [req.userId]);

        res.status(200).json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Não foi possível buscar as suas compras."
        });
    }
});

// Logado: cancelar compra
router.delete("/Cliente_Produto/:id_compra", requireAuth, async (req, res) => {
    const { id_compra } = req.params;

    try {
        const removido = await db.query("DELETE FROM Cliente_Produto WHERE id_usuario = $1 AND id_compra = $2 RETURNING *", [req.userId, id_compra]);

        if (removido.rows.length === 0) {
            return res.status(404).json({
                msg: "Compra não encontrada."
            });
        }

        res.status(200).json({
            msg: "Compra removida com sucesso!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Não foi possível remover a compra."
        });
    }
});

// Logado: agendar consulta
router.post("/Cliente_Veterinario", requireAuth, async (req, res) => {
    const { id_veterinario, data_consulta } = req.body;

    try {
        if (!Number.isInteger(Number(id_veterinario)) || Number(id_veterinario) <= 0 || !data_consulta) {
            return res.status(400).json({ msg: "Dados da consulta inválidos." });
        }

        await db.query(
            "INSERT INTO Cliente_Veterinario(id_usuario, id_veterinario, data_consulta) VALUES($1, $2, $3)",
            [req.userId, id_veterinario, data_consulta]
        );

        res.status(201).json({ msg: "Consulta agendada com sucesso!" });
    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({ msg: "Você já possui consulta com este veterinário nesta data." });
        }

        res.status(400).json({ msg: "Não foi possível agendar a consulta." });
    }
});

// Logado: minhas consultas (com dados do veterinário)
router.get("/Cliente_Veterinario", requireAuth, async (req, res) => {
    try {
        const resultado = await db.query(
            `SELECT cv.id_usuario, cv.id_veterinario, cv.data_consulta,
                    v.nome, v.especializacao
             FROM Cliente_Veterinario cv JOIN Veterinarios v ON v.id = cv.id_veterinario
             WHERE cv.id_usuario = $1`,
            [req.userId]
        );

        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Não foi possível buscar as suas consultas." });
    }
});

// Logado: cancelar consulta
router.delete("/Cliente_Veterinario/:id_veterinario/:data_consulta", requireAuth, async (req, res) => {
    const { id_veterinario, data_consulta } = req.params;

    try {
        const removido = await db.query(
            "DELETE FROM Cliente_Veterinario WHERE id_usuario = $1 AND id_veterinario = $2 AND data_consulta = $3 RETURNING *",
            [req.userId, id_veterinario, data_consulta]
        );

        if (removido.rows.length === 0) {
            return res.status(404).json({ msg: "Consulta não encontrada." });
        }

        res.status(200).json({ msg: "Consulta removida com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Não foi possível remover a consulta." });
    }
});

// Logado: registrar atendimento
router.post("/Pet_Veterinario", requireAuth, async (req, res) => {
    const { id_pet, id_veterinario, data_atendimento, observacoes } = req.body;

    try {
        if (observacoes && observacoes.length > 200) {
            return res.status(400).json({ msg: "As observações devem ter no máximo 200 caracteres." });
        }

        await db.query(
            "INSERT INTO Pet_Veterinario(id_pet, id_veterinario, data_atendimento, observacoes) VALUES($1, $2, $3, $4)",
            [id_pet, id_veterinario, data_atendimento, observacoes || null]
        );

        res.status(201).json({ msg: "Atendimento veterinário cadastrado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Não foi possível cadastrar o atendimento veterinário." });
    }
});

// Logado: listar atendimentos
router.get("/Pet_Veterinario", requireAuth, async (req, res) => {
    try {
        const resultado = await db.query("SELECT * FROM Pet_Veterinario");
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Não foi possível buscar os atendimentos veterinários." });
    }
});

module.exports = router;