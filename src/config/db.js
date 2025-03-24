const mysql = require('mysql2/promise');
require('dotenv').config();

const { SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB } = process.env;

if (!SQL_HOST || !SQL_USER || !SQL_PASSWORD || !SQL_DB) {
  throw new Error(
    '❌ Отсутствуют переменные окружения для подключения к базе данных',
  );
}

const poolSize = 20;

const pool = mysql.createPool({
  host: SQL_HOST,
  user: SQL_USER,
  password: SQL_PASSWORD,
  database: SQL_DB,
  waitForConnections: true,
  connectionLimit: poolSize,
  queueLimit: 0,
});

setInterval(() => {
  pool
    .query('SELECT 1')
    .then(() => {
      console.log('✅ MySQL keep-alive ping');
    })
    .catch((err) => {
      console.error(
        '❌ Ошибка при поддержании соединения с MySQL:',
        err.message,
      );
    });
}, 200000);

module.exports = pool;
