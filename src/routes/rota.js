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

































/*cliente /pet*/


router.post("/cliente-pet", async (req, res, next) => {

  try {

    const { id_usuario, id_pet } = req.body;

    if (!id_usuario || !id_pet) {

      return res.status(400).json({

        erro: "informe o id do pet e do cliente "

      });

    }

    await db.execute(

      `INSERT INTO Cliente_Pet (id_usuario, id_pet) VALUES ($1, $2)`,

      [id_usuario, id_pet]

    );

    return res.status(201).json({

      mensagem: "Pet vinculado ao cliente com sucesso"
    
    });

  } catch (error) {

    next(error);

  }

});



// Listar pets vinculados de um cliente

router.get("/cliente-pet/:id_usuario", async (req, res, next) => {

  try {

    const { id_usuario } = req.params;

    const [pets] = await db.execute(

      `SELECT p.* FROM Cliente_Pet cp JOIN Pets p ON p.id = cp.id_pet WHERE cp.id_usuario = $1`,

      [id_usuario]

    );

    return res.status(200).json(pets);

  } catch (error) {

    next(error);

  }

});




// Desvincular um pet de um cliente

router.delete("/cliente-pet/:id_usuario/:id_pet", async (req, res, next) => {

    try {

      const { id_usuario, id_pet } = req.params;

      const [resultado] = await db.execute(

        `DELETE FROM Cliente_Pet WHERE id_usuario = $1 AND id_pet = $2`,

        [id_usuario, id_pet]

      );

      if (resultado.affectedRows === 0) {

        return res.status(404).json({

          erro: "Vínculo entre pet e cliente não encontrado"

        });

      }

      return res.status(200).json({

        mensagem: "Pet desvinculado respectivo cliente"

      });

    } catch (error) {

      next(error);

    }

  }

);










/*cliente /produto*/

/*cliente /vet*/

/*pet /vet*/





module.exports = router;