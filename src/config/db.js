const mysql = require('mysql2/promise');
require('dotenv').config();

const { SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB } = process.env;

if (!SQL_HOST || !SQL_USER || !SQL_PASSWORD || !SQL_DB) {
  throw new Error('❌ Отсутствуют переменные окружения для подключения к базе данных');
}

// Оптимизированный pool size: после оптимизации запросов (SQL JOIN) нужно меньше соединений
// 10 соединений достаточно для большинства нагрузок
const poolSize = 10;
const pool = mysql.createPool({
  host: SQL_HOST,
  user: SQL_USER,
  password: SQL_PASSWORD,
  database: SQL_DB,
  waitForConnections: true,
  connectionLimit: poolSize,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 30000,
  // Соединения автоматически освобождаются после запросов
  // Keep-alive ping не нужен - pool сам управляет соединениями
});

// Wrapper function to retry failed queries
async function executeWithRetry(queryFn, retries = 3, delay = 500) {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await queryFn();
    } catch (err) {
      lastError = err;

      // Only retry on connection errors
      if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log(`Reconnecting after ${err.code}, attempt ${attempt + 1}/${retries}`);
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      } else {
        // Don't retry on other errors
        break;
      }
    }
  }

  throw lastError;
}

// Override the query method to add retry logic
const originalQuery = pool.query.bind(pool);
pool.query = function (...args) {
  return executeWithRetry(() => originalQuery(...args));
};

// Graceful shutdown function
async function closePool() {
  return new Promise((resolve, reject) => {
    pool.end((err) => {
      if (err) {
        console.error('❌ Ошибка при закрытии pool:', err);
        reject(err);
      } else {
        console.log('✅ Pool закрыт успешно');
        resolve();
      }
    });
  });
}

// Экспортируем pool и функцию для graceful shutdown
module.exports = pool;
module.exports.closePool = closePool;
