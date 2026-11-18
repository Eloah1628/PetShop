const IdChecagem = (req, res, next) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ msg: "Id inválido."});
    }

    next();
};


const IdBodyChecagem = (req, res, next) => {

    const camposId = Object.keys(req.body).filter(campo =>
        campo.startsWith("id_") || campo.startsWith("novo_id_")
    );

    if (camposId.length < 2) {
        return res.status(400).json({msg: "Informe os identificadores necessários."});
    }

    for (const campo of camposId) {

        const valor = Number(req.body[campo]);

        if (!Number.isInteger(valor) || valor <= 0) {
            return res.status(400).json({
                msg: `O campo ${campo} possui um ID inválido.`
            });
        }
    }

    next();
};


module.exports = { IdChecagem, IdBodyChecagem };
