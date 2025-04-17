const mysql = require('mysql2/promise');
require('dotenv').config();

const { SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB } = process.env;

if (!SQL_HOST || !SQL_USER || !SQL_PASSWORD || !SQL_DB) {
  throw new Error(
    '❌ Отсутствуют переменные окружения для подключения к базе данных',
  );
}

const poolSize = 30;
const pool = mysql.createPool({
  host: SQL_HOST,
  user: SQL_USER,
  password: SQL_PASSWORD,
  database: SQL_DB,
  waitForConnections: true,
  connectionLimit: poolSize,
  queueLimit: 0,
  enableKeepAlive: true, // Enable TCP keep-alive
  keepAliveInitialDelay: 10000, // Initial delay before sending keep-alive probes
  connectTimeout: 30000, // Increase connection timeout to 30 seconds
});

// More frequent keep-alive to prevent ECONNRESET
const pingInterval = 30000; // 30 seconds
setInterval(() => {
  pool
    .query('SELECT 1')
    .then(() => {
      console.log('✅ MySQL keep-alive ping successful');
    })
    .catch((err) => {
      console.error(
        '❌ Ошибка при поддержании соединения с MySQL:',
        err.message,
      );
    });
}, pingInterval);

// Wrapper function to retry failed queries
async function executeWithRetry(queryFn, retries = 3, delay = 500) {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await queryFn();
    } catch (err) {
      lastError = err;

      // Only retry on connection errors
      if (
        err.code === 'ECONNRESET' ||
        err.code === 'PROTOCOL_CONNECTION_LOST'
      ) {
        console.log(
          `Reconnecting after ${err.code}, attempt ${attempt + 1}/${retries}`,
        );
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

module.exports = pool;
