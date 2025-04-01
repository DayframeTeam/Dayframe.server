const taskRoutes = require('../routes/tasks');
const templateTasksRoutes = require('../routes/templateTasks');
const subtasksRoutes = require('../routes/subtasksRoutes');

function registerRoutes(app) {
  // app.use('/api/users', userRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/subtasks', subtasksRoutes);
  // app.use('/api/templateTasks', templateTasksRoutes);
  // app.use('/api/templateSubtasks', templateSubtasksRoutes);
}

module.exports = registerRoutes;
