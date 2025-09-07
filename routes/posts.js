const Router = require('koa-router');
const postController = require('../controllers/PostController');
const { requireAuth, requirePages } = require('../middleware/auth');

const router = new Router({
  prefix: '/api/posts'
});

// All routes require authentication
router.use(requireAuth);

// Create scheduled post
router.post('/schedule', requirePages, postController.createScheduledPost);

// Get all scheduled posts
router.get('/scheduled', postController.getScheduledPosts);

// Get specific scheduled post
router.get('/scheduled/:id', postController.getScheduledPostById);

// Delete scheduled post
router.delete('/scheduled/:id', postController.deleteScheduledPost);

// Generate content variations
router.post('/generate-variations', postController.generateContentVariations);

// Analyze content
router.post('/analyze', postController.analyzeContent);

module.exports = router;
