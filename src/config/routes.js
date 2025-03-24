const taskRoutes = require('../routes/tasks');
const userRoutes = require('../routes/users');
const calendarRoutes = require('../routes/calendar');
const planRoutes = require('../routes/plans');

function registerRoutes(app) {
  app.use('/api/users', userRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/plans', planRoutes);
  app.use('/api/calendar', calendarRoutes);
}

module.exports = registerRoutes;
