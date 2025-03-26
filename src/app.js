const express = require('express');
const cors = require('cors');
const registerRoutes = require('./config/routes');
const db = require('./config/db');

const app = express();

app.use(
  cors({
    origin: '*',
    methods: 'GET,POST,PATCH,DELETE',
    allowedHeaders: '*',
  }),
);
app.use(express.json());

registerRoutes(app);

db.getConnection()
  .then((connection) => {
    return connection.ping().then(() => {
      console.log('✅ Успешное подключение к базе данных MySQL');
      connection.release();
    });
  })
  .catch((err) => {
    console.error('❌ Ошибка подключения к базе данных:', err);
    process.exit(1); // Остановить сервер, если подключение не удалось
  });

module.exports = app;
