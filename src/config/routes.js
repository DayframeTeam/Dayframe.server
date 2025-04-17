const taskRoutes = require('../entities/task/task.routes');
const userRoutes = require('../entities/user/user.routes');

function registerRoutes(app) {
  app.use('/api/users', userRoutes);
  app.use('/api/tasks', taskRoutes);
  // app.use('/api/templateTasks', templateTasksRoutes);
  // app.use('/api/templateSubtasks', templateSubtasksRoutes);
}

module.exports = registerRoutes;
