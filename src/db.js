const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || "database",
  user: process.env.DB_USER || "usuario",
  password: process.env.DB_PASS || "senha",
  database: process.env.DB_NAME || "bancodados",
  port: process.env.DB_PORT || 5432,
});

const query = (text, params) => pool.query(text, params);

async function transaction(operar) {
  const conexao = await pool.connect();
  try {
    await conexao.query('BEGIN');
    const result = await operar(conexao);
    await conexao.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await conexao.query('ROLLBACK');
    } catch (erroRollback) {
      console.error("Erro ao realizar ROLLBACK:", erroRollback);
    }
    throw err;
  } finally {
    conexao.release();
  }
}

module.exports = { query, transaction };
