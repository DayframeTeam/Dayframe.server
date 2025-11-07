const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();
const host = process.env.APP_IP || '0.0.0.0';
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, host, () => {
  console.log(`Server running on http://${host}:${PORT}`);
});

// Graceful shutdown handlers
const shutdown = async (signal) => {
  console.log(`\n${signal} получен. Начинаем graceful shutdown...`);

  // Останавливаем прием новых запросов
  server.close(() => {
    console.log('✅ HTTP сервер закрыт');
  });

  // Закрываем соединения с БД
  if (app.gracefulShutdown) {
    await app.gracefulShutdown();
  } else {
    process.exit(0);
  }
};

// Обработка сигналов для graceful shutdown
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown('uncaughtException');
});
