const db = require('../config/db');

async function getAllTasksByUser(userId) {
  const [tasks] = await db.query('SELECT * FROM tasks WHERE user_id = ?', [
    userId,
  ]);

  const taskIds = tasks.map((task) => task.id);
  if (taskIds.length === 0)
    return [
      [
        /* пусто */
      ],
    ];

  const [subtasks] = await db.query(
    'SELECT * FROM subtasks WHERE parent_task_id IN (?)',
    [taskIds],
  );

  const subtasksByTaskId = {};
  for (const subtask of subtasks) {
    if (!subtasksByTaskId[subtask.parent_task_id]) {
      subtasksByTaskId[subtask.parent_task_id] = [];
    }
    subtasksByTaskId[subtask.parent_task_id].push(subtask);
  }

  // Прикрепляем подзадачи
  const enrichedTasks = tasks.map((task) => ({
    ...task,
    subtasks: subtasksByTaskId[task.id] || [],
  }));

  return [enrichedTasks];
}

async function getTaskById(id) {
  const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
  if (!tasks.length) return [[]];

  const [subtasks] = await db.query(
    'SELECT * FROM subtasks WHERE parent_task_id = ?',
    [id],
  );

  const enriched = {
    ...tasks[0],
    subtasks,
  };

  return [[enriched]];
}

function addTask(task) {
  const {
    title,
    description,
    status = false,
    category,
    priority,
    exp = 0,
    duration,
    start_time,
    end_time,
    task_date,
    user_id,
  } = task;

  return db.query(
    `INSERT INTO tasks (
      title, description, status, category, priority, exp,
      duration, start_time, end_time, task_date, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description,
      status,
      category,
      priority,
      exp,
      duration,
      start_time,
      end_time,
      task_date,
      user_id,
    ],
  );
}

function deleteTaskById(id) {
  return db.query('DELETE FROM tasks WHERE id = ?', [id]);
}

function setTaskStatus(status, id) {
  return db.query('UPDATE tasks SET is_done = ? WHERE id = ?', [status, id]);
}

function updateTaskById(id, task) {
  const {
    title,
    description,
    status,
    category,
    priority,
    exp,
    duration,
    start_time,
    end_time,
    task_date,
  } = task;

  return db.query(
    `UPDATE tasks SET
      title = ?, description = ?, status = ?, category = ?, priority = ?, exp = ?,
      duration = ?, start_time = ?, end_time = ?, task_date = ?
     WHERE id = ?`,
    [
      title,
      description,
      status,
      category,
      priority,
      exp,
      duration,
      start_time,
      end_time,
      task_date,
      id,
    ],
  );
}

function updateStatusBySubtasks(taskId) {
  return Promise.all([
    db.query(
      'SELECT COUNT(*) AS total FROM subtasks WHERE parent_task_id = ?',
      [taskId],
    ),
    db.query(
      'SELECT COUNT(*) AS completed FROM subtasks WHERE parent_task_id = ? AND is_done = 1',
      [taskId],
    ),
  ]).then(([[rowsTotal], [rowsCompleted]]) => {
    const total = rowsTotal[0].total;
    const completed = rowsCompleted[0].completed;
    const newStatus = total > 0 && total === completed ? 1 : 0;

    return db.query('UPDATE tasks SET is_done = ? WHERE id = ?', [
      newStatus,
      taskId,
    ]);
  });
}

module.exports = {
  getAllTasksByUser,
  getTaskById,
  addTask,
  deleteTaskById,
  setTaskStatus,
  updateTaskById,
  updateStatusBySubtasks,
};
