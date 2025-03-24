const db = require('../config/db');

// Таблица пользователей
const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(191) DEFAULT NULL,
      password VARCHAR(255) NOT NULL,
      telegram_id BIGINT,
      is_premium BOOLEAN DEFAULT FALSE,
      exp INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица users создана'))
    .catch((err) => console.error('❌ Ошибка создания таблицы users:', err));
};

// Таблица задач
const createTasksTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      status ENUM('done', 'planned') DEFAULT 'planned',
      duration VARCHAR(10),
      category ENUM('required', 'optional'),
      priority ENUM('low', 'medium', 'high'),
      start_time TIME,
      exp TINYINT,
      description TEXT,
      task_date DATE DEFAULT NULL,
      source ENUM('manual', 'plan', 'calendar') DEFAULT 'manual',
      repeat_rule ENUM('daily', 'weekly', 'quest') DEFAULT NULL,
      source_id INT,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица tasks обновлена'))
    .catch((err) => console.error('❌ Ошибка создания таблицы tasks:', err));
};


// Таблица шаблонов
const createPlansTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      duration VARCHAR(10),
      category ENUM('required', 'optional'),
      priority ENUM('low', 'medium', 'high'),
      exp TINYINT,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      repeat_rule ENUM('daily', 'weekly', 'quest') DEFAULT 'daily',
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица plans обновлена'))
    .catch((err) => console.error('❌ Ошибка создания таблицы plans:', err));
};

// Таблица календаря
const createCalendarEventsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      start_time TIME NOT NULL,
      event_date DATE NOT NULL,
      duration VARCHAR(10),
      category ENUM('required', 'optional'),
      priority ENUM('low', 'medium', 'high'),
      repeat_rule ENUM('daily', 'weekly', 'quest') DEFAULT NULL,
      exp TINYINT,
      description TEXT,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица calendar_events обновлена'))
    .catch((err) =>
      console.error('❌ Ошибка создания таблицы calendar_events:', err),
    );
};

// Запуск
createUsersTable()
  .then(() => createPlansTable())
  .then(() => createCalendarEventsTable())
  .then(() => createTasksTable())
  .catch((err) => console.error('❌ Общая ошибка создания таблиц:', err))
  .finally(() => {
    db.end().then(() => {
      console.log('🔌 Подключение к БД закрыто');
      process.exit(0);
    });
  });
