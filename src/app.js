const express = require('express');
const cors = require('cors');
const registerRoutes = require('./config/routes');
const db = require('./config/db');

const app = express();

// Middleware setup
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://www.dayframe.ru',
      'https://dayframe.ru',
      'https://dayframe.na4u.ru',
    ],
    methods: 'GET,POST,PATCH,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
  })
);
app.use(express.json());

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 second timeout for requests
  res.setTimeout(30000);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Register routes
registerRoutes(app);

// Оптимизированная проверка подключения - использует pool.query вместо getConnection
// Это не занимает отдельное соединение
async function checkDatabaseConnection() {
  try {
    await db.query('SELECT 1');
    console.log('✅ Успешное подключение к базе данных MySQL');
    return true;
  } catch (err) {
    console.error('❌ Ошибка подключения к базе данных:', err.message);
    return false;
  }
}

// Try to connect multiple times before giving up
async function ensureDatabaseConnection(attempts = 5, delay = 5000) {
  for (let i = 0; i < attempts; i++) {
    const connected = await checkDatabaseConnection();
    if (connected) return true;

    if (i < attempts - 1) {
      console.log(`Повторная попытка подключения к БД (${i + 1}/${attempts})...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.error('❌ Не удалось подключиться к базе данных после нескольких попыток.');
  return false;
}

// Start with connection check
ensureDatabaseConnection().then((connected) => {
  if (!connected) {
    console.warn('⚠️ Сервер запущен, но соединение с БД не установлено!');
  }
});

// Graceful shutdown function
async function gracefulShutdown() {
  console.log('🛑 Начало graceful shutdown...');
  const dbModule = require('./config/db');

  try {
    if (dbModule.closePool) {
      await dbModule.closePool();
    }
    console.log('✅ Graceful shutdown завершен');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка при graceful shutdown:', err);
    process.exit(1);
  }
}

// Экспортируем app и функцию для graceful shutdown
const appWithShutdown = app;
appWithShutdown.gracefulShutdown = gracefulShutdown;

module.exports = appWithShutdown;
