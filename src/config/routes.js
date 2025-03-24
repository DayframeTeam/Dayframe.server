const taskRoutes = require('../routes/tasks');
const userRoutes = require('../routes/users');

function registerRoutes(app) {
  app.use('/api/tasks', taskRoutes);
  app.use('/api/users', userRoutes);
}

module.exports = registerRoutes;
