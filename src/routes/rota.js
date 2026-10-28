const express = require("express");
const router = express.Router();
const db = require("../db");
const {IdChecagem, IdBodyChecagem} = require('../middlewares/Checagens.js');

router.get("/", (req, res) => {
  res.status(200).json({msg: "Bem vindo ao express_template_docker!!!"});
});

/*Rotas de Usuarios*/
router.get("/usuarios", async (req, res, next) => {
  const ListaUsuarios = await db.query("SELECT * FROM Usuarios")
  res.status(200).json(ListaUsuarios.rows)
})

router.get("/usuario/:id", IdChecagem, async (req, res, next) => {
  const id = req.params.id;
  const usuario = await db.query("SELECT * FROM Usuarios WHERE id = $1", [id]);
  res.status(200).json(usuario.rows[0]);
})

router.post("/usuario", async (req, res, next) => {
  const {nome, email, genero} = req.body
  
  const novoUsuario = await db.query("INSERT INTO Usuarios(nome, email, genero) VALUES($1, $2, $3) RETURNING *", [nome, email, genero]);
  res.status(201).json(novoUsuario.rows[0]);
})

router.get("/usuarios", async (req, res, next) => {
  const ListaUsuarios = await db.query("SELECT * FROM Usuarios");
  res.status(200).json(ListaUsuarios.rows);
})

router.get("/usuario/:id", IdChecagem, async (req, res, next) => {
  const id = req.params.id;

  const usuario = await db.query("SELECT * FROM Usuarios WHERE id = $1", [id]);
  res.status(200).json(usuario.rows[0]); });

router.post("/usuario", async (req, res, next) => {
  const {nome, email, genero} = req.body;
  
  const novoUsuario = await db.query("INSERT INTO Usuarios(nome, email, genero) VALUES($1, $2, $3) RETURNING *",[nome, email, genero]);
  res.status(201).json(novoUsuario.rows[0]);
})

router.put("/usuario/:id", IdChecagem, async (req, res, next) => {
  const id = req.params.id;
  const {nome, email, genero} = req.body;

  const usuarioAtualizado = await db.query("UPDATE Usuarios SET nome = $1, email = $2, genero = $3 WHERE id = $4 RETURNING *", [nome, email, genero, id]);
  res.status(200).json(usuarioAtualizado.rows[0]);
})

router.delete("/usuario/:id", IdChecagem, async (req, res, next) => {
  const id = req.params.id;
  
  const usuarioRemovido = await db.query("DELETE FROM Usuarios WHERE id = $1 RETURNING *",[id]);
  res.status(200).json({mensagem: "Usuário removido com sucesso.", usuario: usuarioRemovido.rows[0] })
})

/*Rotas de Pets*/
router.get("/pets", async (req, res, next) => {

})

router.get("/pet/:id", IdChecagem, async (req, res, next) => {
  
})

//Lista checada
const Generos = ['F', 'f', 'M', 'm']

router.post("/pet", async (req, res, next) => {
  const {genero} = req.body;

    if (!Generos.includes(genero)) {
      return res.status(400).json({msg : "Gênero inválido."});
    }

    const novoPet = await db.query("INSERT INTO Pets(nome, idade, sexo, descricao, historico_vet, estado_atual) VALUES($1, $2, $3, $4, $5, $6)", [nome, idade, sexo, descricao, historico_vet, estado_atual])
})

router.put("/pet/:id", IdChecagem, async (req, res, next) => {
  const id = req.params.id;
  const {nome, idade, sexo, descricao, historico_vet, estado_atual} = req.body;

  const petAtualizado = await db.query("UPDATE Pets SET nome = $1, idadei = $2, sexo = $3, descricao = $4, historico_vet = $5, estado_atual = $6 WHERE id = $7", [nome, idade, sexo, descricao, historico_vet, estado_atual, id]);
  res.status(200).json(petAtualizado.rows[0]);
})

router.delete("/pet/:id", IdChecagem, async (req, res, next) => {
  const id = req.params.id;
  const petRemovido = await db.query("DELETE * FROM Pets WHERE id = $1", [id])
  res.status(200).json({msg : "Usuário removido com sucesso.", usuario: usuarioRemovido.rows[0]})
})

/*Rotas de Produtos*/
router.get("/produtos", async (req, res, next) => {
  const ListaProdutos = await db.query("SELECT * FROM Produtos")
  res.status(200).json(ListaProdutos.rows)
})

router.get("/produto/:id", IdChecagem, async (req, res, next) => {

})

router.post("/produto", async (req, res, next) => {

})

router.put("/produto/:id", IdChecagem, async (req, res, next) => {

})

router.delete("produto/:id", IdChecagem, async (req, res, next) => {

})

/*Rotas de Veterinarios*/
router.get("/veterinarios", async (req, res, next) => {
  const ListaVeterinarios = await db.query("SELECT * FROM Veterinarios")
  res.status(200).json(ListaVeterinarios.rows)
})

router.get("/veterinario/:id", IdChecagem, async (req, res, next) => {

})

router.post("/veterinario", async (req, res, next) => {

})

router.put("/veterinario/:id", IdChecagem, async (req, res, next) => {

})

router.delete("veterinario/:id", IdChecagem, async (req, res, next) => {

})













































// CLIENTE - PET


app.post("/Cliente_Pet", IdBodyChecagem, async (req, res) => {

  const {id_usuario, id_pet } = req.body;

  try {

    await db.query(

      "INSERT INTO Cliente_Pet(id_usuario, id_pet) VALUES($1, $2)",

      [id_usuario, id_pet]
        
    );

    res.status(201).json({

      msg: "Pet cadastrado ao cliente com sucesso!"

    });

  } catch (error) {

    res.status(400).json({

      msg: "Não foi possível cadastrar o pet ao cliente, tente novamente"

    });
    
  }

});

// GET
app.get("/Cliente_Pet", async (req, res) => {

  try {

    const resultado = await db.query(

      "SELECT * FROM Cliente_Pet"

    );

    res.status(200).json(resultado.rows);

  } catch (error) {

    res.status(400).json({

      msg: "Não foi possível buscar os pets dos clientes."

    });

  }

});


// PUT
app.put("/Cliente_Pet", IdBodyChecagem, async (req, res) => {

  const {id_usuario, id_pet, novo_id_usuario, novo_id_pet } = req.body;

  try {

    await db.query(

      "UPDATE Cliente_Pet SET id_usuario = $1, id_pet = $2 WHERE id_usuario = $3 AND id_pet = $4",

      [novo_id_usuario, novo_id_pet, id_usuario, id_pet]

    );

    res.status(200).json({

      msg: "Cadastro do pet ao cliente atualizado com sucesso!"

    });

  } catch (error) {

    res.status(400).json({

      msg: "Não foi possível atualizar o cadastro do pet ao cliente."

    });

  }

});


// DELETE
app.delete("/Cliente_Pet", IdBodyChecagem, async (req, res) => {

  const {id_usuario, id_pet } = req.body;

  try {

    await db.query(

      "DELETE FROM Cliente_Pet WHERE id_usuario = $1 AND id_pet = $2",

      [id_usuario, id_pet]

    );

    res.status(200).json({

      msg: "Pet removido do cliente com sucesso!"

    });

  } catch (error) {

    res.status(400).json({

      msg: "Não foi possível remover o pet do cliente."

    });

  }

});























// CLIENTE - PET

app.post("/Cliente_Produto", IdBodyChecagem , async (req, res) => {

  const {id_usuario, id_produto, quantidade, data_compra } = req.body;

  try {

    await db.query(

      "INSERT INTO Cliente_Produto(id_usuario, id_produto, quantidade, data_compra) VALUES($1, $2, $3, $4)",

      [id_usuario, id_produto, quantidade, data_compra]

    );

    res.status(201).json({

      msg: "Compra feita com sucesso!"

    });

    } catch (error) {

    res.status(400).json({

      msg: "Não foi possível registrar a compra."

    });

  }

});





// CLIENTE - VET

app.post("/Cliente_Veterinario", IdBodyChecagem , async (req, res) => {

  const {id_usuario, id_veterinario, data_consulta } = req.body;

  try {

    await db.query(

        "INSERT INTO Cliente_Veterinario(id_usuario, id_veterinario, data_consulta) VALUES($1, $2, $3)",

        [id_usuario, id_veterinario, data_consulta]

      );

      res.status(201).json({

        msg: "Consulta marcada com sucesso!"

      });

    } catch (error) {

    res.status(400).json({

      msg: "Não foi possível cadastrar a consulta."

    });

  }

});



// PET - VET 

app.post("/Pet_Veterinario", IdBodyChecagem , async (req, res) => {

  const {id_pet, id_veterinario, data_atendimento, observacoes } = req.body;

  try {

    if (observacoes && observacoes.length > 200) {

      return res.status(400).json({

        msg: "As observações devem ter no máximo 200 caracteres."

      });
      
    } else {

      await db.query(

        "INSERT INTO Pet_Veterinario(id_pet, id_veterinario, data_atendimento, observacoes) VALUES($1, $2, $3, $4)",

        [id_pet, id_veterinario, data_atendimento, observacoes || null]

      );

      res.status(201).json({

        msg: "Atendimento veterinário cadastrado com sucesso!"

      });

    }

  } catch (error) {

      res.status(400).json({

        msg: "Não foi possível cadastrar o atendimento veterinário."

      });

  }

});



module.exports = router;

