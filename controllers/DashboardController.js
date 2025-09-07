const User = require('../models/User');
const ScheduledPost = require('../models/ScheduledPost');

class DashboardController {
  async showDashboard(ctx) {
    try {
      if (!ctx.session.userId) {
        ctx.redirect('/auth/facebook');
        return;
      }

      const user = await User.findById(ctx.session.userId);
      if (!user) {
        ctx.session = null;
        ctx.redirect('/auth/facebook');
        return;
      }

      // Get user's scheduled posts
      const scheduledPosts = await ScheduledPost.findByUserId(user.id);
      
      // Get statistics
      const stats = {
        totalPosts: scheduledPosts.length,
        scheduledPosts: scheduledPosts.filter(post => post.isScheduled()).length,
        publishedPosts: scheduledPosts.filter(post => post.isPublished()).length,
        failedPosts: scheduledPosts.filter(post => post.isFailed()).length,
        totalPages: user.pages.length
      };

      await ctx.render('dashboard', {
        user: user.toJSON(),
        pages: user.pages,
        scheduledPosts: scheduledPosts.map(post => post.toJSON()),
        stats
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      ctx.status = 500;
      ctx.body = 'เกิดข้อผิดพลาดในการโหลดหน้าแดชบอร์ด';
    }
  }

  async getDashboardData(ctx) {
    try {
      if (!ctx.session.userId) {
        ctx.status = 401;
        ctx.body = { error: 'ไม่ได้เข้าสู่ระบบ' };
        return;
      }

      const user = await User.findById(ctx.session.userId);
      if (!user) {
        ctx.status = 404;
        ctx.body = { error: 'ไม่พบผู้ใช้' };
        return;
      }

      const scheduledPosts = await ScheduledPost.findByUserId(user.id);
      
      const stats = {
        totalPosts: scheduledPosts.length,
        scheduledPosts: scheduledPosts.filter(post => post.isScheduled()).length,
        publishedPosts: scheduledPosts.filter(post => post.isPublished()).length,
        failedPosts: scheduledPosts.filter(post => post.isFailed()).length,
        totalPages: user.pages.length
      };

      // Get recent posts (last 10)
      const recentPosts = scheduledPosts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(post => post.toJSON());

      ctx.body = {
        user: user.toJSON(),
        pages: user.pages,
        stats,
        recentPosts
      };
    } catch (error) {
      console.error('Get dashboard data error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด' };
    }
  }

  async getPageAnalytics(ctx) {
    try {
      if (!ctx.session.userId) {
        ctx.status = 401;
        ctx.body = { error: 'ไม่ได้เข้าสู่ระบบ' };
        return;
      }

      const user = await User.findById(ctx.session.userId);
      if (!user) {
        ctx.status = 404;
        ctx.body = { error: 'ไม่พบผู้ใช้' };
        return;
      }

      const scheduledPosts = await ScheduledPost.findByUserId(user.id);
      
      // Analyze posts by page
      const pageAnalytics = user.pages.map(page => {
        const pagePosts = scheduledPosts.filter(post => 
          post.results.some(result => result.pageId === page.id)
        );

        const successfulPosts = pagePosts.filter(post => 
          post.results.some(result => result.pageId === page.id && result.status === 'scheduled')
        );

        const failedPosts = pagePosts.filter(post => 
          post.results.some(result => result.pageId === page.id && result.status === 'failed')
        );

        return {
          pageId: page.id,
          pageName: page.name,
          totalPosts: pagePosts.length,
          successfulPosts: successfulPosts.length,
          failedPosts: failedPosts.length,
          successRate: pagePosts.length > 0 ? (successfulPosts.length / pagePosts.length) * 100 : 0
        };
      });

      ctx.body = { pageAnalytics };
    } catch (error) {
      console.error('Get page analytics error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติเพจ' };
    }
  }
}

module.exports = new DashboardController();
