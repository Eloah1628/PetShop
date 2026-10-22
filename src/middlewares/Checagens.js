const IdChecagem = (req, res, next) => {
    const {id} = req.params;

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({msg : "Id Inválido"});
    } else if (id <= 0) {
        return res.status(400).json({msg : "Número de Id Inválido"})
    }

    next();
};

module.exports = validarId