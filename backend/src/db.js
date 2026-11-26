const {Pool} = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || "database",
  user: process.env.DB_USER || "usuario",
  password: process.env.DB_PASS || "senha",
  database: process.env.DB_NAME || "PetShopLuzzie",
  port: process.env.DB_PORT || 5432,
});

const query = (text, params) => pool.query(text, params);

module.exports = {query};