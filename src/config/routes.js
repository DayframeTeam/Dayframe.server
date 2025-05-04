const taskRoutes = require('../entities/task/task.routes');
const userRoutes = require('../entities/user/user.routes');
const templateTaskRoutes = require('../entities/template.task/template.task.routes');
const authRoutes = require('../entities/auth/auth.routes');
function registerRoutes(app) {
  app.use('/api/auth', authRoutes);
  // app.use('/api/users', userRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/templateTasks', templateTaskRoutes);
}

module.exports = registerRoutes;
