const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo ao express_template_docker!!!" });
});

/*Rotas de Usuarios*/
router.get("/usuarios", async (req, res, next) => {
  const ListaUsuarios = await db.query("SELECT * FROM Usuarios")
  res.status(200).json(ListaUsuarios.rows)
})

router.get("/usuario/:id", IdChecagem("Usuarios"), async (req, res, next) => {

})

router.post("/usuario", async (req, res, next) => {

})

router.put("/usuario/:id", IdChecagem("Usuarios"), async (req, res, next) => {

})

router.delete("usuario/:id", IdChecagem("Usuarios"), async (req, res, next) => {

})

/*Rotas de Pets*/
router.get("/pets", async (req, res, next) => {

})

router.get("/pet/:id", IdChecagem("Pets"), async (req, res, next) => {
  
})

//Lista checada
const Generos = ['F', 'f', 'M', 'm']

router.post("/pet", async (req, res, next) => {
  const {genero} = req.body;

    if (!Generos.includes(genero)) {
      return res.status(400).json({msg : "Gênero inválido."});
    }
})

router.put("/pet/:id", IdChecagem("Pets"), async (req, res, next) => {
  
})

router.delete("/pet/:id", IdChecagem("Pets"), async (req, res, next) => {
  
})

/*Rotas de Produtos*/
router.get("/produtos", async (req, res, next) => {
  const ListaProdutos = await db.query("SELECT * FROM Produtos")
  res.status(200).json(ListaProdutos.rows)
})

router.get("/produto/:id", IdChecagem("Produtos"), async (req, res, next) => {

})

router.post("/produto", async (req, res, next) => {

})

router.put("/produto/:id", IdChecagem("Produtos"), async (req, res, next) => {

})

router.delete("produto/:id", IdChecagem("Produtos"), async (req, res, next) => {

})

/*Rotas de Veterinarios*/
router.get("/veterinarios", async (req, res, next) => {
  const ListaVeterinarios = await db.query("SELECT * FROM Veterinarios")
  res.status(200).json(ListaVeterinarios.rows)
})

router.get("/veterinario/:id", IdChecagem("Veterinarios"), async (req, res, next) => {

})

router.post("/veterinario", async (req, res, next) => {

})

router.put("/veterinario/:id", IdChecagem("Veterinarios"), async (req, res, next) => {

})

router.delete("veterinario/:id", IdChecagem("Veterinarios"), async (req, res, next) => {

})

































app.post("/Cliente_Pet", async (req, res) => {

  const { id_usuario, id_pet } = req.body;

  try {

    if (!Number.isInteger(id_usuario) || !Number.isInteger(id_pet)) {

      return res.status(400).json({

        msg: "Reenvie o ID do usuário e o ID do pet corretamente."

      });

    } else {

      await db.query(

        "INSERT INTO Cliente_Pet(id_usuario, id_pet) VALUES($1, $2)",

        [id_usuario, id_pet]
          
      );

      res.status(201).json({

        msg: "Pet cadastrado ao cliente com sucesso!"

      });

    }

  } catch (error) {

    res.status(400).json({

      msg: "Não foi possível cadastrar o pet ao cliente, tente novamente"

    });
    
  }

});









/*cliente /produto*/

app.post("/Cliente_Produto", async (req, res) => {

  const { id_usuario, id_produto, quantidade, data_compra } = req.body;

  try {

    if (
      !Number.isInteger(id_usuario) || !Number.isInteger(id_produto) || !Number.isInteger(quantidade) || quantidade <= 0 || !data_compra) {

        return res.status(400).json({

          msg: "Informe os dados da compra novamente. A quantidade de itens deve ser maior que zero."

        });

    } else {

      await db.query(

        "INSERT INTO Cliente_Produto(id_usuario, id_produto, quantidade, data_compra) VALUES($1, $2, $3, $4)",

        [id_usuario, id_produto, quantidade, data_compra]

      );

      res.status(201).json({

        msg: "Compra feita com sucesso!"

      });

    }

  } catch (error) {

    res.status(400).json({

      msg: "Não foi possível registrar a compra."

    });

  }

});

/*cliente /vet*/

/*pet /vet*/





module.exports = router;

/*
app.post("/Cavaleiro", VerificaLista(GenerosAceitaveis, "sexo"), async (req, res) => {
    const {nome, sobrenome, idade, sexo, funcao} = req.body;

    try { 
        if(!Number.isInteger(idade) || idade < 14 || idade > 80) {
            return res.status(400).json({msg : "Idade deve ser um número inteiro entre 14 e 80."});
        } else {
            await db.query("INSERT INTO Cavaleiro(nome, sobrenome, idade, sexo, funcao) VALUES($1, $2, $3, $4, $5)", [nome, sobrenome, idade, sexo, funcao]);
            res.status(201).json({msg : "Cavaleiro adicionado com sucesso!"});
        }
    } catch (error) {
        res.status(400).json({msg :"Não foi possível cadastrar."});
    }
});
*/