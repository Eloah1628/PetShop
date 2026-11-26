const jwt = require("jsonwebtoken");
const db = require("../db");

// Exige que o usuário esteja logado (header: Authorization: Bearer <token>)
const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Você precisa estar logado para acessar este recurso." });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id_usuario;
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Sessão inválida ou expirada. Faça login novamente." });
  }
};

// Exige que o usuário logado seja administrador (use DEPOIS do requireAuth)
const requireAdmin = async (req, res, next) => {
  try {
    const resultado = await db.query("SELECT is_admin FROM Usuarios WHERE id = $1", [req.userId]);

    if (resultado.rows.length === 0 || !resultado.rows[0].is_admin) {
      return res.status(403).json({ msg: "Acesso restrito a administradores." });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao verificar permissões." });
  }
};

module.exports = { requireAuth, requireAdmin };