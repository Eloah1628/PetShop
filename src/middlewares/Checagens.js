const IdChecagem = (req, res, next) => {
    const id = req.params;

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({msg : "Id Inválido"});
    } else if (id <= 0) {
        return res.status(400).json({msg : "Número de Id Inválido"})
    }

    next();
};



const IdBodyChecagem = (req, res, next) => {

    const id = req.body.id;

    if (!id || isNaN(Number(id))) {

        return res.status(400).json({msg : "Id Inválido"});

    } else if (Number(id) <= 0) {

        return res.status(400).json({msg : "Número de Id Inválido"});

    } else {

        const {id_usuario, id_veterinario, data_consulta} = req.body;

        if (!Number.isInteger(Number(id_usuario)) || Number(id_usuario) <= 0 || !Number.isInteger(Number(id_veterinario)) || Number(id_veterinario) <= 0 || !data_consulta) {

            return res.status(400).json({

                msg: "Informe novamente o ID do usuário, o ID do veterinário e a data da consulta."

            });

        }

    }

    next();

};
    
module.exports = {IdChecagem, IdBodyChecagem};