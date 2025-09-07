const Router = require('koa-router');
const authController = require('../controllers/AuthController');
const { requireAuth } = require('../middleware/auth');

const router = new Router({
  prefix: '/auth'
});

// Facebook login
router.get('/facebook', authController.login);

// Facebook callback
router.get('/facebook/callback', authController.callback);

// Logout
router.get('/logout', authController.logout);

// Get current user (protected)
router.get('/me', requireAuth, authController.getCurrentUser);

// Refresh pages (protected)
router.post('/refresh-pages', requireAuth, authController.refreshPages);

module.exports = router;
