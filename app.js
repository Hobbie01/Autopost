const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const views = require('koa-views');
const session = require('koa-session');
const cron = require('node-cron');
require('dotenv').config();

// Import routes
const routes = require('./routes');

// Import middleware
const { errorHandler, requestLogger } = require('./middleware/auth');

// Import database for cleanup
const db = require('./config/database');

const app = new Koa();

// Session configuration
app.keys = [process.env.SESSION_SECRET || 'your-secret-key'];
app.use(session(app));

// Middleware
app.use(errorHandler);
app.use(requestLogger);
app.use(bodyParser());
app.use(serve('public'));
app.use(views('views', { extension: 'ejs' }));

// Routes
app.use(routes.routes()).use(routes.allowedMethods());

// Cleanup old data (run daily at midnight)
cron.schedule('0 0 * * *', () => {
  db.cleanup();
  console.log('🧹 Cleaned up old data');
});

// Error handling
app.on('error', (err, ctx) => {
  console.error('Server error:', err);
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Facebook Login: http://localhost:${PORT}/auth/facebook`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  });
}

module.exports = app;
