const validarId = (req, res, next) => {
    const {id} = req.params;

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({msg : "Id Inválido"});
    } else if (id <= 0) {
        return res.status(400).json({msg : "Número de Id Inválido"})
    }

    next();
};

const ChecagemGenero = (tabela, parametros = []) => {
    return (req, res, next) => {
        const genero = req.body.genero;
        if (!genero) {
            return res.status(400).json({erro: "Gênero não informado."});
        }
        const parametroValido = parametros.length > 0;

        if (!parametroValido) {
            return res.status(400).json({erro: "Nenhum parâmetro informado.", tabela, genero});
        }
        next();
    };
};

module.exports = {
validarId,
validarGenero
};