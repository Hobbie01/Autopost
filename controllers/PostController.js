const ScheduledPost = require('../models/ScheduledPost');
const User = require('../models/User');
const OpenAIService = require('../services/OpenAIService');
const facebookConfig = require('../config/facebook');

class PostController {
  async createScheduledPost(ctx) {
    try {
      if (!ctx.session.userId) {
        ctx.status = 401;
        ctx.body = { error: 'ไม่ได้เข้าสู่ระบบ' };
        return;
      }

      const { originalText, selectedPages, scheduledTime } = ctx.request.body;

      if (!originalText || !selectedPages || !scheduledTime) {
        ctx.status = 400;
        ctx.body = { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
        return;
      }

      // Validate scheduled time
      const scheduledDate = new Date(scheduledTime);
      if (scheduledDate <= new Date()) {
        ctx.status = 400;
        ctx.body = { error: 'เวลาที่กำหนดต้องเป็นอนาคต' };
        return;
      }

      const user = await User.findById(ctx.session.userId);
      if (!user) {
        ctx.status = 404;
        ctx.body = { error: 'ไม่พบผู้ใช้' };
        return;
      }

      // Generate enhanced content using OpenAI
      const enhancedContent = await OpenAIService.enhanceContent(originalText);

      // Filter selected pages
      const targetPages = user.pages.filter(page => selectedPages.includes(page.id));

      if (targetPages.length === 0) {
        ctx.status = 400;
        ctx.body = { error: 'ไม่พบเพจที่เลือก' };
        return;
      }

      // Create scheduled post record
      const scheduledPost = await ScheduledPost.create({
        userId: user.id,
        originalText,
        enhancedContent,
        scheduledTime,
        status: 'scheduled'
      });

      // Schedule posts for each selected page
      const results = [];
      for (const page of targetPages) {
        try {
          const postData = await facebookConfig.createScheduledPost(
            page.id,
            page.access_token,
            enhancedContent,
            scheduledTime
          );

          results.push({
            pageId: page.id,
            pageName: page.name,
            postId: postData.id,
            status: 'scheduled'
          });
        } catch (error) {
          console.error(`Error scheduling post for page ${page.name}:`, error);
          results.push({
            pageId: page.id,
            pageName: page.name,
            error: error.message,
            status: 'failed'
          });
        }
      }

      // Update scheduled post with results
      await scheduledPost.update({ results });

      ctx.body = {
        success: true,
        message: 'จัดตารางโพสต์เรียบร้อยแล้ว',
        post: scheduledPost.toJSON()
      };
    } catch (error) {
      console.error('Create scheduled post error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการจัดตารางโพสต์: ' + error.message };
    }
  }

  async getScheduledPosts(ctx) {
    try {
      if (!ctx.session.userId) {
        ctx.status = 401;
        ctx.body = { error: 'ไม่ได้เข้าสู่ระบบ' };
        return;
      }

      const posts = await ScheduledPost.findByUserId(ctx.session.userId);
      ctx.body = { posts: posts.map(post => post.toJSON()) };
    } catch (error) {
      console.error('Get scheduled posts error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์' };
    }
  }

  async getScheduledPostById(ctx) {
    try {
      if (!ctx.session.userId) {
        ctx.status = 401;
        ctx.body = { error: 'ไม่ได้เข้าสู่ระบบ' };
        return;
      }

      const { id } = ctx.params;
      const post = await ScheduledPost.findById(id);

      if (!post) {
        ctx.status = 404;
        ctx.body = { error: 'ไม่พบโพสต์' };
        return;
      }

      if (post.userId !== ctx.session.userId) {
        ctx.status = 403;
        ctx.body = { error: 'ไม่มีสิทธิ์เข้าถึงโพสต์นี้' };
        return;
      }

      ctx.body = { post: post.toJSON() };
    } catch (error) {
      console.error('Get scheduled post error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์' };
    }
  }

  async deleteScheduledPost(ctx) {
    try {
      if (!ctx.session.userId) {
        ctx.status = 401;
        ctx.body = { error: 'ไม่ได้เข้าสู่ระบบ' };
        return;
      }

      const { id } = ctx.params;
      const post = await ScheduledPost.findById(id);

      if (!post) {
        ctx.status = 404;
        ctx.body = { error: 'ไม่พบโพสต์' };
        return;
      }

      if (post.userId !== ctx.session.userId) {
        ctx.status = 403;
        ctx.body = { error: 'ไม่มีสิทธิ์ลบโพสต์นี้' };
        return;
      }

      if (!post.canBeCancelled()) {
        ctx.status = 400;
        ctx.body = { error: 'ไม่สามารถยกเลิกโพสต์นี้ได้' };
        return;
      }

      // Try to delete posts from Facebook
      for (const result of post.getSuccessfulResults()) {
        try {
          await facebookConfig.deletePost(result.postId, result.pageAccessToken);
        } catch (error) {
          console.error(`Error deleting post ${result.postId}:`, error);
        }
      }

      await post.delete();

      ctx.body = { 
        success: true, 
        message: 'ยกเลิกโพสต์เรียบร้อยแล้ว' 
      };
    } catch (error) {
      console.error('Delete scheduled post error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการยกเลิกโพสต์: ' + error.message };
    }
  }

  async generateContentVariations(ctx) {
    try {
      const { originalText, count = 3 } = ctx.request.body;

      if (!originalText) {
        ctx.status = 400;
        ctx.body = { error: 'กรุณากรอกข้อความต้นฉบับ' };
        return;
      }

      const variations = await OpenAIService.generateMultipleVariations(originalText, count);
      
      ctx.body = {
        success: true,
        variations
      };
    } catch (error) {
      console.error('Generate variations error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการสร้างเนื้อหาทางเลือก: ' + error.message };
    }
  }

  async analyzeContent(ctx) {
    try {
      const { content } = ctx.request.body;

      if (!content) {
        ctx.status = 400;
        ctx.body = { error: 'กรุณากรอกเนื้อหา' };
        return;
      }

      const analysis = await OpenAIService.analyzeContent(content);
      
      ctx.body = {
        success: true,
        analysis
      };
    } catch (error) {
      console.error('Analyze content error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการวิเคราะห์เนื้อหา: ' + error.message };
    }
  }
}

module.exports = new PostController();
