const Router = require('koa-router');
const authRoutes = require('./auth');
const postRoutes = require('./posts');
const dashboardRoutes = require('./dashboard');

const router = new Router();

// Home route
router.get('/', async (ctx) => {
  if (ctx.session.userId) {
    ctx.redirect('/dashboard');
  } else {
    await ctx.render('index');
  }
});

// Health check
router.get('/health', async (ctx) => {
  ctx.body = { 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});

// Mount sub-routes
router.use(authRoutes.routes(), authRoutes.allowedMethods());
router.use(postRoutes.routes(), postRoutes.allowedMethods());
router.use(dashboardRoutes.routes(), dashboardRoutes.allowedMethods());

module.exports = router;
