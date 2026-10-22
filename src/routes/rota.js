const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo ao express_template_docker!!!" });
});

//Lista checada
const Generos = ['F', 'f', 'M', 'm']

/*Rotas de Pets*/
app.get("/pet", async (req, res, next) => {

})

app.get("/pet/:id", async (req, res, next) => {
  
})


module.exports = router;