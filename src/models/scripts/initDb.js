const db = require('../../config/db');

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
      title TEXT NOT NULL,
      description TEXT DEFAULT NULL,
      category TEXT DEFAULT NULL,
      priority ENUM('low', 'medium', 'high') DEFAULT NULL,
      exp TINYINT DEFAULT 0,
      start_time TIME DEFAULT NULL,
      end_time TIME DEFAULT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      special_id TEXT,
      is_done BOOLEAN DEFAULT FALSE,
      task_date DATE DEFAULT NULL,
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
      title TEXT NOT NULL,
      description TEXT DEFAULT NULL,
      category TEXT DEFAULT NULL,
      priority ENUM('low', 'medium', 'high') DEFAULT NULL,
      exp TINYINT DEFAULT 0,
      start_time TIME DEFAULT NULL,
      end_time TIME DEFAULT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      special_id TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      repeat_rule TEXT DEFAULT NULL,
      start_active_date DATE DEFAULT NULL,
      end_active_date DATE DEFAULT NULL,
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

const createDaysTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS days (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      user_id INT NOT NULL,
      repeat_days TEXT DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица days создана'))
    .catch((err) => console.error('❌ Ошибка создания таблицы days:', err));
};

const createDayTasksTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS day_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT NULL,
      category TEXT DEFAULT NULL,
      priority ENUM('low', 'medium', 'high') DEFAULT NULL,
      exp TINYINT DEFAULT 0,
      start_time TIME DEFAULT NULL,
      end_time TIME DEFAULT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      special_id TEXT,
      day_id INT NOT NULL,
      FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица day_tasks создана'))
    .catch((err) =>
      console.error('❌ Ошибка создания таблицы day_tasks:', err),
    );
};

const createSubtasksTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS subtasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title TEXT NOT NULL,
      position INT NOT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      special_id TEXT NOT NULL,
      is_done BOOLEAN DEFAULT FALSE,
      parent_task_id INT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
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
      title TEXT NOT NULL,
      position INT NOT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      special_id TEXT NOT NULL,
      template_task_id INT NOT NULL,
      FOREIGN KEY (template_task_id) REFERENCES template_tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица template_subtasks создана'))
    .catch((err) =>
      console.error('❌ Ошибка создания таблицы template_subtasks:', err),
    );
};

const createDayTaskSubtasksTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS day_task_subtasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title TEXT NOT NULL,
      position INT NOT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      special_id TEXT NOT NULL,
      day_task_id INT NOT NULL,
      FOREIGN KEY (day_task_id) REFERENCES day_tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  return db
    .query(query)
    .then(() => console.log('✅ Таблица day_task_subtasks создана'))
    .catch((err) =>
      console.error('❌ Ошибка создания таблицы day_task_subtasks:', err),
    );
};

createUsersTable()
  .then(() => createTemplateTasksTable())
  .then(() => createTasksTable())
  .then(() => createSubtasksTable())
  .then(() => createTemplateSubtasksTable())
  .then(() => createDaysTable())
  .then(() => createDayTasksTable())
  .then(() => createDayTaskSubtasksTable())
  .finally(() => {
    db.end().then(() => {
      console.log('🔌 Подключение к БД закрыто');
      process.exit(0);
    });
  });
