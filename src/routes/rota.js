const express = require("express");
const router = express.Router();

const db = require("../db");

const {IdChecagem, IdBodyChecagem} = require('../middlewares/Checagens.js');

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
    res.status(200).json({msg : "Bem vindo ao PetShopLuzzie!"});
});

/*Rotas de Usuarios*/
router.get("/usuarios", async (req, res) => {
  try {
      const ListaUsuarios = await db.query("SELECT id, nome, email, cpf FROM Usuarios");

      res.status(200).json(ListaUsuarios.rows);

  } catch (error) {

      res.status(500).json({msg : "Erro ao buscar usuários."});
}
});

router.get("/usuario/:id", IdChecagem, async (req, res) => {
  try {
    const {id} = req.params.id;

    const usuario = await db.query("SELECT id, nome, email, cpf FROM Usuarios WHERE id = $1", [id]);

    if (usuario.rows.length === 0) {
      return res.status(404).json({msg : "Usuário não encontrado."});
  }

    res.status(200).json(usuario.rows[0]);

  } catch (error) {
    res.status(500).json({msg : "Erro ao buscar usuário."});
}
});

router.post("/usuario", async (req, res) => {
  const {nome, email, senha, cpf} = req.body;

  try {
    if (!nome || !email || !senha || !cpf) {
      return res.status(400).json({msg : "Preencha todos os campos."});
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const UsuarioInscrito = await db.query("INSERT INTO Usuarios (nome, email, senha, cpf) VALUES($1, $2, $3, $4) RETURNING id, nome, email, cpf", [nome, email, senhaHash, cpf]);

    res.status(201).json(UsuarioInscrito.rows[0]);
  } catch (error) {


    if (error.code === "23505") {
      return res.status(409).json({msg : "Email ou CPF já cadastrado."});
    }

    res.status(500).json({msg : "Erro ao cadastrar usuário."});
}
});

router.post("/usuario/login", async (req, res) => {
  const {email, senha} = req.body;

  try {
    if (!email || !senha) {
      return res.status(400).json({msg : "Informe o email e a senha."});
    }
    const Perfil = await db.query("SELECT id, nome, email, senha FROM Usuarios WHERE email = $1",[email]);

    if (Perfil.rows.length === 0) {
      return res.status(401).json({msg : "Email ou senha incorretos."});
    }

    const usuario = Perfil.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({msg : "Email ou senha incorretos."});
    }

    const token = jwt.sign(
      {id_usuario: usuario.id},
      process.env.JWT_SECRET,
      {expiresIn: "3h"}
    );

    res.status(200).json({msg : "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (error) {
    res.status(500).json({msg : "Não foi possível realizar o login."});
  }
});

router.put("/usuario/:id", IdChecagem, async (req, res) => {
  const {id} = req.params.id;
  const {nome, email, cpf} = req.body;

  try {
    const UsuarioAtualizado = await db.query("UPDATE Usuarios SET nome = $1, email = $2, cpf = $3 WHERE id = $4 RETURNING id, nome, email, cpf", [nome, email, cpf, id]);

    if (UsuarioAtualizado.rows.length === 0) {
      return res.status(404).json({msg : "Usuário não encontrado."});
    }

    res.status(200).json(UsuarioAtualizado.rows[0]);
  } catch (error) {

    res.status(500).json({msg : "Erro ao atualizar usuário;"});
  }
});

router.delete("/usuario/:id", IdChecagem, async (req, res) => {
  try {
    const {id} = req.params.id;

    const UsuarioRemovido = await db.query("DELETE FROM Usuarios WHERE id = $1 RETURNING id, nome, email, cpf", [id]);

    if (UsuarioRemovido.rows.length === 0) {
      return res.status(404).json({msg : "Usuário não encontrado."});
    }

    res.status(200).json({msg : "Usuário removido com sucesso.", usuario: UsuarioRemovido.rows[0]});

  } catch (error) {
    res.status(500).json({msg : "Erro ao remover usuário."});
  }
});

/*Rotas de Pets*/
router.get("/pets", async (req, res) => {
  try {
    const ListaPets = await db.query("SELECT * FROM Pets");
    res.status(200).json(ListaPets.rows[0])
  } catch (error) {
    return res.status(500).json({msg : "Erro ao buscar pets."})
  }
});

router.get("/pet/:id", IdChecagem, async (req, res) => {
  try {
    const {id} = req.params.id;
    const Pet = await db.query("SELECT * FROM Pets WHERE id = $1", [id]);

    if (Pet.rows.length === 0) {
      return res.status(404).json({msg : "Pet não encontrado."});
    }

    res.status(200).json(Pet.rows[0]);
  } catch (error) {
    return res.status(500).json({msg : "Erro ao buscar pet."})
  }
})

//Lista checada
const Generos = ['F', 'f', 'M', 'm']

router.post("/pet", async (req, res) => {
  const {nome, idade, sexo, descricao, historico_vet, estado_atual} = req.body;

  try {
    if (!Generos.includes(sexo)) {
      return res.status(400).json({msg : "Sexo inválido."});
  }
    const novoPet = await db.query("INSERT INTO Pets(nome, idade, sexo, descricao, historico_vet, estado_atual) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [nome, idade, sexo, descricao, historico_vet, estado_atual]);
    res.status(201).json(novoPet.rows[0]);

  } catch (error) {
    return res.status(500).json({msg : "Erro ao cadastrar pet."})
}
    

    
})

router.put("/pet/:id", IdChecagem, async (req, res) => {
  const {id} = req.params.id;
  const {nome, idade, sexo, descricao, historico_vet, estado_atual} = req.body;
  try {

    if (!Generos.includes(sexo)) {
      return res.status(400).json({msg : "Sexo inválido."});
  }

    const petAtualizado = await db.query("UPDATE Pets SET nome = $1, idade = $2, sexo = $3, descricao = $4, historico_vet = $5, estado_atual = $6 WHERE id = $7 RETURNING *", [nome, idade, sexo, descricao, historico_vet, estado_atual, id]);

    if (petAtualizado.rows.length === 0) {
      return res.status(404).json({msg : "Pet não encontrado."});
  }

    res.status(200).json(petAtualizado.rows[0]);

  } catch (error) {
    return res.status(500).json({msg : "Erro ao atualizar pet."})
}
  
})

router.delete("/pet/:id", IdChecagem, async (req, res) => {
  const {id} = req.params.id;
  try {
    const petRemovido = await db.query("DELETE FROM Pets WHERE id = $1 RETURNING *", [id]);

    if (petRemovido.rows.length === 0) {
      return res.status(404).json({msg : "Pet não encontrado."});
  }

    res.status(200).json({msg : "Pet removido com sucesso.", pet: petRemovido.rows[0]})

  } catch (error) {
    return res.status(500).json({msg : "Erro ao remover pet."})
}
  
})

/*Rotas de Produtos*/
router.get("/produtos", async (req, res) => {
  try {
    const ListaProdutos = await db.query("SELECT * FROM Produtos");
    res.status(200).json(ListaProdutos.rows)

    } catch (error) {
    res.status(500).json({msg : "Erro ao buscar produtos."});
  }
});

router.get("/produto/:id", IdChecagem, async (req, res) => {
  try {
    const {id} = req.params.id;

    const Produto = await db.query("SELECT * FROM Produtos WHERE id = $1",[id]);

    if (Produto.rows.length === 0) {
      return res.status(404).json({msg : "Produto não encontrado."});
    }

    res.status(200).json(Produto.rows[0]);

    } catch (error) {
    res.status(500).json({msg : "Erro ao buscar produto."});
  }
});

router.post("/produto", async (req, res) => {
  const {nome, descricao, preco, quant_estoque} = req.body;

  try {
    if (!nome || !descricao || typeof preco !== "number" ||
      !Number.isFinite(preco) || preco <= 0 ||
      !Number.isInteger(quant_estoque) || quant_estoque <= 0
    ) {
      return res.status(400).json({msg: "Dados do produto inválidos."});
    }

    const ProdutoCadastrado = await db.query("INSERT INTO Produtos (nome, descricao, preco, quant_estoque) VALUES($1, $2, $3, $4) RETURNING *", [nome, descricao, preco, quant_estoque]);
    res.status(201).json(ProdutoCadastrado.rows[0]);
    } catch (error) {
    res.status(500).json({msg : "Erro ao cadastrar produto."});
  }
});

router.put("/produto/:id", IdChecagem, async (req, res) => {
  const {id} = req.params.id;
  const {nome, descricao, preco, quant_estoque} = req.body;

  try {
  if (!nome || !descricao || preco <= 0 ||
    !Number.isInteger(quant_estoque) || quant_estoque <= 0) {
    return res.status(400).json({msg : "Dados do produto inválidos."});
  }

  const ProdutoEditado = await db.query(
    "UPDATE Produtos SET nome = $1, descricao = $2, preco = $3, quant_estoque = $4 WHERE id = $5 RETURNING *", [nome, descricao, preco, quant_estoque, id]);

  if (ProdutoEditado.rows.length === 0) {
    return res.status(404).json({msg : "Produto não encontrado."});
  }

  res.status(200).json(ProdutoEditado.rows[0]);
  } catch (error) {
    res.status(500).json({msg : "Erro ao atualizar produto."});
  }
});

router.delete("/produto/:id", IdChecagem, async (req, res) => {
  try {
    const {id} = req.params.id;
    const ProdutoRemovido = await db.query("DELETE FROM Produtos WHERE id = $1 RETURNING *", [id]);

    if (ProdutoRemovido.rows.length === 0) {
      return res.status(404).json({msg : "Produto não encontrado."});
    }

    res.status(200).json({msg : "Produto removido com sucesso!", produto: ProdutoRemovido.rows[0]});

    } catch (error) {
    res.status(500).json({msg : "Erro ao remover produto."});
}
});

/*Rotas de Veterinarios*/
router.get("/veterinarios", async (req, res) => {
  try {
    const ListaVeterinarios = await db.query("SELECT * FROM Veterinarios");
    res.status(200).json(ListaVeterinarios.rows);
  } catch (error) {
    res.status(500).json({msg : "Erro ao buscar os veterinários."});
  }
});

router.get("/veterinario/:id", IdChecagem, async (req, res) => {
  try {
    const {id} = req.params.id;
    const veterinario = await db.query("SELECT * FROM Veterinarios WHERE id = $1", [id]);

    if (veterinario.rows.length === 0) {
      return res.status(404).json({msg : "Veterinário não encontrado."});
    }

    res.status(200).json(veterinario.rows[0]);
  } catch (error) {
    res.status(500).json({msg : "Erro ao buscar o veterinário."});
  }
});

router.post("/veterinario", async (req, res) => {
  try {
    const { nome, email, telefone, crmv, data_nasc, especializacao } = req.body;
    if (!nome || !data_nasc) {
      return res.status(400).json({msg : "Nome e data de nascimento são obrigatórios."});
    }

    const novoVeterinario = await db.query(
      "INSERT INTO Veterinarios (nome, email, telefone, crmv, data_nasc, especializacao) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [nome, email ?? null, telefone ?? null, crmv ?? null, data_nasc, especializacao ?? null]
    );

    res.status(201).json(novoVeterinario.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({msg : "Email ou CRMV já cadastrado."});
    }
    res.status(500).json({msg : "Erro ao cadastrar o veterinário."});
  }
});

router.put("/veterinario/:id", IdChecagem, async (req, res) => {
  try {
    const {id} = req.params.id;
    const {nome, email, telefone, crmv, data_nasc, especializacao} = req.body;

    if (!nome || !data_nasc) {
      return res.status(400).json({msg : "Nome e data de nascimento são obrigatórios."});
    }
    
    //?? verifica se o valor é nulo
    const veterinarioAtualizado = await db.query("UPDATE Veterinarios SET nome = $1, email = $2, telefone = $3, crmv = $4 WHERE id = $5 RETURNING *", [nome, email ?? null, telefone ?? null, crmv ?? null, data_nasc, especializacao ?? null, id]);

    if (veterinarioAtualizado.rows.length === 0) {
      return res.status(404).json({msg : "Veterinário não encontrado."});
    }

    res.status(200).json(veterinarioAtualizado.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({msg : "Email ou CRMV já cadastrado."});
    }
    res.status(500).json({msg : "Erro ao atualizar o veterinário."});
  }
});

router.delete("/veterinario/:id", IdChecagem, async (req, res) => {
  try {
    const {id} = req.params.id;
    const veterinarioRemovido = await db.query("DELETE FROM Veterinarios WHERE id = $1 RETURNING *", [id]);

    if (veterinarioRemovido.rows.length === 0) {
      return res.status(404).json({msg : "Veterinário não encontrado."});
    }
    res.status(200).json({msg : "Veterinário removido com sucesso."});
  } catch (error) {
    res.status(500).json({msg : "Erro ao remover o veterinário."});
  }
});



















// CLIENTE - PET


router.post("/Cliente_Pet", IdBodyChecagem, async (req, res) => {

  const {id_usuario, id_pet} = req.body;

  try {

    await db.query(

      "INSERT INTO Cliente_Pet(id_usuario, id_pet) VALUES($1, $2)",

      [id_usuario, id_pet]
        
    );

    res.status(201).json({msg : "Pet cadastrado ao cliente com sucesso!"});

  } catch (error) {

    res.status(400).json({msg : "Não foi possível cadastrar o pet ao cliente, tente novamente"});
    
}

});


// GET
router.get("/Cliente_Pet", async (req, res) => {

  try {

    const resultado = await db.query(

      "SELECT * FROM Cliente_Pet"

    );

    res.status(200).json(resultado.rows[0]);

  } catch (error) {

    res.status(400).json({msg : "Não foi possível buscar os pets dos clientes."});

}

});


// GET BY ID
router.get("/Cliente_Pet/:id", IdChecagem, async (req, res) => {
  const {id} = req.params.id;

  try {

    const resultado = await db.query(

      "SELECT * FROM Cliente_Pet WHERE id = $1",
      [id]

    );

    res.status(200).json(resultado.rows[0]);

  } catch (error) {

    res.status(400).json({msg : "Não foi possível buscar os pets dos clientes."});

}

});


// PUT
router.put("/Cliente_Pet", IdBodyChecagem, async (req, res) => {

  const {id_usuario, id_pet, novo_id_usuario, novo_id_pet} = req.body;

  try {

    await db.query(

      "UPDATE Cliente_Pet SET id_usuario = $1, id_pet = $2 WHERE id_usuario = $3 AND id_pet = $4",

      [novo_id_usuario, novo_id_pet, id_usuario, id_pet]

    );

    res.status(200).json({msg : "Cadastro do pet ao cliente atualizado com sucesso!"});

  } catch (error) {

    res.status(400).json({msg : "Não foi possível atualizar o cadastro do pet ao cliente."});

}

});


// DELETE
router.delete("/Cliente_Pet", IdBodyChecagem, async (req, res) => {

  const {id_usuario, id_pet} = req.body;

  try {

    await db.query(

      "DELETE FROM Cliente_Pet WHERE id_usuario = $1 AND id_pet = $2",

      [id_usuario, id_pet]

    );

    res.status(200).json({msg : "Pet removido do cliente com sucesso!"});

  } catch (error) {

    res.status(400).json({msg : "Não foi possível remover o pet do cliente."});

}

});


// CLIENTE - PRODUTO

router.post("/Cliente_Produto", IdBodyChecagem , async (req, res) => {

  const {id_usuario, id_produto, quantidade, data_compra} = req.body;

  try {

    await db.query(

      "INSERT INTO Cliente_Produto(id_usuario, id_produto, quantidade, data_compra) VALUES($1, $2, $3, $4)",

      [id_usuario, id_produto, quantidade, data_compra]

    );

    res.status(201).json({msg : "Compra feita com sucesso!"});

    } catch (error) {

    res.status(400).json({msg : "Não foi possível registrar a compra."});

}

});


// GET
router.get("/Cliente_Produto", async (req, res) => {

  try {
  
    const resultado = await db.query( "SELECT * FROM Cliente_Produto");
    
    res.status(200).json(resultado.rows[0]);
    
  } catch (error) {
  
    res.status(400).json({msg : "Não foi possível buscar as compras dos clientes."});
    
  }
  
});
  

// GET BY ID
router.get("/Cliente_Produto/:id", IdChecagem, async (req, res) => {
  const {id} = req.params.id;

  try {
  
    const resultado = await db.query( "SELECT * FROM Cliente_Produto WHERE id = $1", [id]);
    
    res.status(200).json(resultado.rows[0]);
    
  } catch (error) {
  
    res.status(400).json({msg : "Não foi possível buscar as compras dos clientes."});
    
  }
  
});


// PUT
router.put("/Cliente_Produto", IdBodyChecagem, async (req, res) => {

  const {id_usuario, id_produto, quantidade, data_compra} = req.body;
  
  try {
  
    await db.query(
      
      "UPDATE Cliente_Produto SET quantidade = $1, data_compra = $2 WHERE id_usuario = $3 AND id_produto = $4",
      
      [quantidade, data_compra, id_usuario, id_produto]
      
    );
  
    res.status(200).json({msg : "Compra atualizada com sucesso!"});
  
  } catch (error) {
  
    res.status(400).json({msg : "Não foi possível atualizar a compra."});
  
}

});

  
// DELETE
router.delete("/Cliente_Produto", IdBodyChecagem, async (req, res) => {
  
  const {id_usuario, id_produto} = req.body;
  
  try {
  
    await db.query(
    
      "DELETE FROM Cliente_Produto WHERE id_usuario = $1 AND id_produto = $2",
      
      [id_usuario, id_produto]
    
    );
  
    res.status(200).json({msg : "Compra removida com sucesso!"});
  
  } catch (error) {
  
    res.status(400).json({msg : "Não foi possível remover a compra."});
  
  }
  
});
  
  

// CLIENTE - VET

router.post("/Cliente_Veterinario", IdBodyChecagem , async (req, res) => {

  const {id_usuario, id_veterinario, data_consulta} = req.body;

  try {

    await db.query(

        "INSERT INTO Cliente_Veterinario(id_usuario, id_veterinario, data_consulta) VALUES($1, $2, $3)",

        [id_usuario, id_veterinario, data_consulta]

      );

      res.status(201).json({

        msg : "Consulta marcada com sucesso!"
});

    } catch (error) {

    res.status(400).json({
msg : "Não foi possível cadastrar a consulta."

  });

}

});


// GET
router.get("/Cliente_Veterinario", async (req, res) => {

  try {
  
    const resultado = await db.query( "SELECT * FROM Cliente_Veterinario" );
    
    res.status(200).json(resultado.rows[0]);
  
  } catch (error) {
  
    res.status(400).json({msg : "Não foi possível buscar as consultas dos clientes."});
    
  }
  
});


// GET BY ID
router.get("/Cliente_Veterinario/:id", IdChecagem, async (req, res) => {
  const {id} = req.params.id;

  try {
  
    const resultado = await db.query( "SELECT * FROM Cliente_Veterinario WHERE id = $1", [id] );
    
    res.status(200).json(resultado.rows[0]);
  
  } catch (error) {
  
    res.status(400).json({msg : "Não foi possível buscar as consultas dos clientes."});
    
  }
  
});
  
  
// PUT
router.put("/Cliente_Veterinario", IdBodyChecagem, async (req, res) => {
  
  const {id_usuario, id_veterinario, data_consulta} = req.body;

  try {
  
    await db.query(
    
      "UPDATE Cliente_Veterinario SET data_consulta = $1 WHERE id_usuario = $2 AND id_veterinario = $3",
      
      [data_consulta, id_usuario, id_veterinario]
    
    );
    
    res.status(200).json({msg : "Consulta atualizada com sucesso!"});
  
  } catch (error) {
  
  res.status(400).json({msg : "Não foi possível atualizar a consulta."});
  
}
    
});
  
  
// DELETE
router.delete("/Cliente_Veterinario", IdBodyChecagem, async (req, res) => {
  
  const {id_usuario, id_veterinario} = req.body;
  
  try {
  
    await db.query(

      "DELETE FROM Cliente_Veterinario WHERE id_usuario = $1 AND id_veterinario = $2",

      [id_usuario, id_veterinario]

    );
  
    res.status(200).json({msg : "Consulta removida com sucesso!"});
  
  } catch (error) {
  
  res.status(400).json({msg : "Não foi possível remover a consulta."});
  
  }
  
});


// PET - VET 

router.post("/Pet_Veterinario", IdBodyChecagem , async (req, res) => {

  const {id_pet, id_veterinario, data_atendimento, observacoes} = req.body;

  try {

    if (observacoes && observacoes.length > 200) {

      return res.status(400).json({

        msg : "As observações devem ter no máximo 200 caracteres."
});
      
  } else {

      await db.query(

        "INSERT INTO Pet_Veterinario(id_pet, id_veterinario, data_atendimento, observacoes) VALUES($1, $2, $3, $4)",

        [id_pet, id_veterinario, data_atendimento, observacoes || null]

      );

      res.status(201).json({

        msg : "Atendimento veterinário cadastrado com sucesso!"
});

  }

  } catch (error) {

      res.status(400).json({

        msg : "Não foi possível cadastrar o atendimento veterinário."
});

}

});


// GET
router.get("/Pet_Veterinario", async (req, res) => {

  try {
  
    const resultado = await db.query( "SELECT * FROM Pet_Veterinario");
    
    res.status(200).json(resultado.rows[0]);
  
  } catch (error) {
  
   res.status(400).json({msg : "Não foi possível buscar os atendimentos veterinários."});
  
  }
  
});


// GET BY ID
router.get("/Pet_Veterinario", async (req, res) => {
  const {id} = req.params.id;
  try {
  
    const resultado = await db.query( "SELECT * FROM Pet_Veterinario WHERE id - $1", [id]);
    
    res.status(200).json(resultado.rows[0]);
  
  } catch (error) {
  
   res.status(400).json({msg : "Não foi possível buscar os atendimentos veterinários."});
  
  }
  
});
  
  
// PUT
router.put("/Pet_Veterinario", IdBodyChecagem, async (req, res) => {

  const {id_pet, id_veterinario, data_atendimento, observacoes} = req.body;
  
  try {
  
    if (observacoes && observacoes.length > 200) {
    
      return res.status(400).json({msg : "As observações devem ter no máximo 200 caracteres."});
      
  } else {
    
      await db.query(
      
        "UPDATE Pet_Veterinario SET data_atendimento = $1, observacoes = $2 WHERE id_pet = $3 AND id_veterinario = $4",
        
        [data_atendimento, observacoes || null, id_pet, id_veterinario]
      
      );
      
      res.status(200).json({msg : "Atendimento veterinário atualizado com sucesso!"});
    
  }
  
  } catch (error) {
  
    res.status(400).json({msg : "Não foi possível atualizar o atendimento veterinário."});
  
  }
  
});
  
  
// DELETE
router.delete("/Pet_Veterinario", IdBodyChecagem, async (req, res) => {

  const {id_pet, id_veterinario} = req.body;
  
  try {
  
    await db.query(
    
      "DELETE FROM Pet_Veterinario WHERE id_pet = $1 AND id_veterinario = $2",
      
      [id_pet, id_veterinario]
    
    );
  
    res.status(200).json({msg : "Atendimento veterinário removido com sucesso!"});

  } catch (error) {
  
    res.status(400).json({msg : "Não foi possível remover o atendimento veterinário."});
  
}

});



module.exports = {router}