// scripts/seedInitialData.js
const db = require('../config/db');

;(async () => {
  // 1) ESM-only nanoid через динамический import
  const { nanoid } = await import('nanoid');

  // --- 2) Создаём пользователя с id = 1 ---
  try {
    await db.query(
      `
      INSERT IGNORE INTO users
        (id, username, email, password, timezone)
      VALUES
        (1, 'demo_user', 'demo@example.com', 'password123', 'Europe/Moscow')
      `
    );
    console.log('✅ Пользователь id=1 создан (или уже существует)');
  } catch (err) {
    console.error('❌ Ошибка при создании пользователя:', err);
    await db.end();
    process.exit(1);
  }

  // --- 3) Обычные задачи + subtasks ---
  const tasks = [
    { title: 'April Report',    date: '2025-04-01', start: '09:00:00', end: '10:30:00' },
    { title: 'Team Sync',       date: '2025-04-02', start: '11:00:00', end: '11:15:00' },
  ];

  for (const t of tasks) {
    // 3.1 вставляем задачу
    const [res] = await db.query(
      `
      INSERT INTO tasks
        (title, description, category, priority, exp,
         start_time, end_time, user_id, special_id, is_done, task_date)
      VALUES (?, NULL, 'General', 'medium', 1, ?, ?, 1, ?, FALSE, ?)
      `,
      [
        t.title,
        t.start,
        t.end,
        nanoid(),
        t.date,
      ]
    );
    const taskId = res.insertId;
    console.log(`✅ task "${t.title}" inserted with id=${taskId}`);

    // 3.2 две подзачи для неё
    for (let pos = 1; pos <= 2; pos++) {
      await db.query(
        `
        INSERT INTO subtasks
          (title, position, user_id, special_id, is_done, parent_task_id)
        VALUES (?, ?, 1, ?, FALSE, ?)
        `,
        [
          `${t.title} — subtask ${pos}`,
          pos,
          nanoid(),
          taskId,
        ]
      );
    }
    console.log(`   • 2 subtasks for task id=${taskId}`);
  }

  // --- 4) Шаблонные задачи + template_subtasks ---
  const templateTasks = [
    { title: 'Daily Standup',    repeat_rule: 'daily',   start: '09:00:00', end: '09:10:00' },
    { title: 'Weekly Report',    repeat_rule: 'weekly',  start: '16:00:00', end: '17:00:00' },
  ];

  for (const tt of templateTasks) {
    // 4.1 вставляем шаблонную задачу
    const [res] = await db.query(
      `
      INSERT INTO template_tasks
        (title, description, category, priority, exp,
         start_time, end_time, user_id, special_id, is_active, repeat_rule,
         start_active_date, end_active_date)
      VALUES (?, NULL, 'General', 'medium', 1, ?, ?, 1, ?, TRUE, ?, NULL, NULL)
      `,
      [
        tt.title,
        tt.start,
        tt.end,
        nanoid(),
        tt.repeat_rule,
      ]
    );
    const tplId = res.insertId;
    console.log(`✅ template_task "${tt.title}" inserted with id=${tplId}`);

    // 4.2 две подзачи для шаблона
    for (let pos = 1; pos <= 2; pos++) {
      await db.query(
        `
        INSERT INTO template_subtasks
          (title, position, user_id, special_id, template_task_id)
        VALUES (?, ?, 1, ?, ?)
        `,
        [
          `${tt.title} — template subtask ${pos}`,
          pos,
          nanoid(),
          tplId,
        ]
      );
    }
    console.log(`   • 2 template_subtasks for template_task id=${tplId}`);
  }

  // --- 5) Завершаем соединение ---
  await db.end();
  console.log('🔌 Сидирование данных завершено');
  process.exit(0);
})();
