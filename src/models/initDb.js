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
      is_done BOOLEAN DEFAULT FALSE,
      category VARCHAR(100) DEFAULT NULL,
      priority ENUM('low', 'medium', 'high') DEFAULT NULL,
      exp TINYINT DEFAULT 0,
      duration VARCHAR(10) DEFAULT NULL,
      start_time TIME DEFAULT NULL,
      end_time TIME DEFAULT NULL,
      task_date DATE DEFAULT NULL,
      special_id TEXT DEFAULT NULL,
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
      is_done BOOLEAN DEFAULT TRUE,
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
      special_id TEXT DEFAULT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

//   INSERT INTO `dobru238_dayframe`.`tasks` 
// (`id`, `title`, `description`, `is_done`, `category`, `priority`, `exp`, `duration`, `start_time`, `end_time`, `task_date`, `special_id`, `user_id`, `created_at`)
// VALUES 
// (NULL, 'Утренняя пробежка', 'Пробежать 3 км в парке', 0, 'Здоровье', 'medium', 10, NULL, '07:00:00', '07:30:00', '2025-03-26', 'null', 1, CURRENT_TIMESTAMP),

// (NULL, 'Чтение', 'Прочитать минимум 20 страниц книги', 1, 'Развитие', 'low', 5, NULL, '20:00:00', '21:00:00', '2025-03-25', 'null', 1, CURRENT_TIMESTAMP),

// (NULL, 'Рабочий звонок', 'Совещание с командой', 0, 'Работа', 'high', 20, NULL, '10:00:00', '11:00:00', '2025-03-26', 'null', 1, CURRENT_TIMESTAMP),

// (NULL, 'Покупки', 'Купить продукты на неделю', 0, 'Быт', 'low', 1, NULL, '18:00:00', '19:00:00', '2025-03-27', 'null', 1, CURRENT_TIMESTAMP),

// (NULL, 'Медитация', '10 минут дыхательной практики', 1, 'Здоровье', 'medium', 5, NULL, '06:30:00', '06:40:00', '2025-03-26', 'null', 1, CURRENT_TIMESTAMP),

// (NULL, 'Изучить алгоритмы', 'Посмотреть лекцию и сделать конспект', 0, 'Учёба', 'high', 20, NULL, '21:00:00', '22:30:00', '2025-03-28', 'null', 1, CURRENT_TIMESTAMP),

// (NULL, 'Готовка', 'Приготовить ужин', 1, 'Быт', 'medium', 10, NULL, '17:00:00', '18:00:00', '2025-03-25', 'null', 1, CURRENT_TIMESTAMP),

// (NULL, 'Фокус-блок', '2 часа без отвлечений на задачу X', 0, 'Работа', 'high', 50, NULL, '14:00:00', '16:00:00', '2025-03-26', 'null', 1, CURRENT_TIMESTAMP),

// (NULL, 'Прогулка с собакой', '20 минут во дворе', 0, 'Быт', 'low', 1, NULL, '08:00:00', '08:20:00', '2025-03-26', 'null', 1, CURRENT_TIMESTAMP),

// (NULL, 'Формулировка целей', 'Написать цели на месяц', 0, 'Развитие', 'medium', 10, NULL, '19:00:00', '19:45:00', '2025-03-29', 'null', 1, CURRENT_TIMESTAMP);


// -- К задаче 1 (Утренняя пробежка)
// INSERT INTO `dobru238_dayframe`.`subtasks` 
// (`id`, `parent_task_id`, `title`, `is_done`, `position`, `special_id`, `created_at`) 
// VALUES
// (NULL, 1, 'Разминка перед пробежкой', 1, 0, NULL, CURRENT_TIMESTAMP),
// (NULL, 1, 'Пробежать 3 км', 0, 1, NULL, CURRENT_TIMESTAMP),
// (NULL, 1, 'Растяжка после пробежки', 0, 2, NULL, CURRENT_TIMESTAMP);

// -- К задаче 2 (Чтение)
// INSERT INTO `dobru238_dayframe`.`subtasks` 
// VALUES
// (NULL, 2, 'Выбрать книгу', 1, 0, NULL, CURRENT_TIMESTAMP),
// (NULL, 2, 'Прочитать 20 страниц', 1, 1, NULL, CURRENT_TIMESTAMP);

// -- К задаче 3 (Рабочий звонок)
// INSERT INTO `dobru238_dayframe`.`subtasks` 
// VALUES
// (NULL, 3, 'Подготовить отчёт', 0, 0, NULL, CURRENT_TIMESTAMP),
// (NULL, 3, 'Созвон с командой', 0, 1, NULL, CURRENT_TIMESTAMP);

// -- К задаче 4 (Покупки)
// INSERT INTO `dobru238_dayframe`.`subtasks` 
// VALUES
// (NULL, 4, 'Составить список', 1, 0, NULL, CURRENT_TIMESTAMP),
// (NULL, 4, 'Сходить в магазин', 0, 1, NULL, CURRENT_TIMESTAMP);

// -- К задаче 6 (Изучить алгоритмы)
// INSERT INTO `dobru238_dayframe`.`subtasks` 
// VALUES
// (NULL, 6, 'Посмотреть лекцию', 0, 0, NULL, CURRENT_TIMESTAMP),
// (NULL, 6, 'Сделать конспект', 0, 1, NULL, CURRENT_TIMESTAMP),
// (NULL, 6, 'Решить задачу', 0, 2, NULL, CURRENT_TIMESTAMP);

// -- К задаче 8 (Фокус-блок)
// INSERT INTO `dobru238_dayframe`.`subtasks` 
// VALUES
// (NULL, 8, 'Отключить уведомления', 1, 0, NULL, CURRENT_TIMESTAMP),
// (NULL, 8, 'Сконцентрироваться на задаче X', 0, 1, NULL, CURRENT_TIMESTAMP);
