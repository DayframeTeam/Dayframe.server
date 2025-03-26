const db = require('../config/db');

const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(191) DEFAULT NULL,
      password VARCHAR(255) NOT NULL,
      telegram_id BIGINT DEFAULT NULL,
      is_premium BOOLEAN DEFAULT FALSE,
      user_categories TEXT DEFAULT NULL,
      exp INT DEFAULT 0,
      timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица users создана'))
    .catch((err) => console.error('❌ Ошибка создания таблицы users:', err));
};

const createTasksTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      status BOOLEAN DEFAULT FALSE,
      category VARCHAR(100) DEFAULT NULL,
      priority ENUM('low', 'medium', 'high') DEFAULT NULL,
      exp TINYINT DEFAULT 0,
      duration VARCHAR(10) DEFAULT NULL,
      start_time TIME DEFAULT NULL,
      end_time TIME DEFAULT NULL,
      task_date DATE DEFAULT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица tasks создана'))
    .catch((err) => console.error('❌ Ошибка создания таблицы tasks:', err));
};

const createTemplateTasksTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS template_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      category VARCHAR(100) DEFAULT NULL,
      priority ENUM('low', 'medium', 'high') DEFAULT NULL,
      exp TINYINT DEFAULT 0,
      duration VARCHAR(10) DEFAULT NULL,
      start_time TIME DEFAULT NULL,
      end_time TIME DEFAULT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      special_id VARCHAR(128) NOT NULL UNIQUE,
      repeat_rule TEXT NOT NULL,
      start_date DATE DEFAULT NULL,
      end_date DATE DEFAULT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица template_tasks создана'))
    .catch((err) =>
      console.error('❌ Ошибка создания таблицы template_tasks:', err),
    );
};

const createSubtasksTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS subtasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent_task_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      is_done BOOLEAN DEFAULT FALSE,
      position INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица subtasks создана'))
    .catch((err) => console.error('❌ Ошибка создания таблицы subtasks:', err));
};

const createTemplateSubtasksTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS template_subtasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      template_task_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      position INT DEFAULT 0,
      special_id VARCHAR(128) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_task_id) REFERENCES template_tasks(id) ON DELETE CASCADE
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица template_subtasks создана'))
    .catch((err) =>
      console.error('❌ Ошибка создания таблицы template_subtasks:', err),
    );
};

createUsersTable()
  .then(() => createTemplateTasksTable())
  .catch(() => {})
  .then(() => createTasksTable())
  .catch(() => {})
  .then(() => createSubtasksTable())
  .catch(() => {})
  .then(() => createTemplateSubtasksTable())
  .catch(() => {})
  .finally(() => {
    db.end().then(() => {
      console.log('🔌 Подключение к БД закрыто');
      process.exit(0);
    });
  });
