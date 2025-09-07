const Router = require('koa-router');
const dashboardController = require('../controllers/DashboardController');
const { requireAuth } = require('../middleware/auth');

const router = new Router();

// Dashboard page
router.get('/dashboard', dashboardController.showDashboard);

// Dashboard API endpoints
router.get('/api/dashboard', requireAuth, dashboardController.getDashboardData);
router.get('/api/dashboard/analytics', requireAuth, dashboardController.getPageAnalytics);

module.exports = router;
