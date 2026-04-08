const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
});

pool.on('connect', (client) => {
  client.query("SET client_encoding = 'UTF8'");
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Ошибка подключения к PostgreSQL:', err.message);
    process.exit(1);
  }
  console.log('PostgreSQL подключён успешно');
  release();
});

module.exports = pool;
