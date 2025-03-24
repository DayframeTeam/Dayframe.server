const db = require('../config/db');

// Создание таблицы users
const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(191) DEFAULT NULL,
      password VARCHAR(255) NOT NULL,
      telegram_id BIGINT,
      is_premium BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  return db
    .query(query)
    .then(() => console.log('✅ Таблица users создана (или уже существует)'))
    .catch((err) => console.error('❌ Ошибка создания таблицы users:', err));
};

// Создание таблицы tasks
const createTasksTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      status ENUM('done', 'planned') DEFAULT 'planned',
      duration VARCHAR(10),
      category ENUM('required', 'optional', 'weekly', 'quest'),
      priority ENUM('low', 'medium', 'high'),
      startTime VARCHAR(5),
      exp TINYINT,
      description TEXT,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  return db
    .query(query)
    .then(() => console.log('✅ Таблица tasks создана (или уже существует)'))
    .catch((err) => console.error('❌ Ошибка создания таблицы tasks:', err));
};

// Запуск создания таблиц
createUsersTable()
  .then(() => createTasksTable())
  .catch((err) => console.error('❌ Общая ошибка создания таблиц:', err));
