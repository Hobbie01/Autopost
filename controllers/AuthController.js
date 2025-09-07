const User = require('../models/User');
const facebookConfig = require('../config/facebook');

class AuthController {
  async login(ctx) {
    try {
      const authUrl = facebookConfig.getAuthUrl();
      ctx.redirect(authUrl);
    } catch (error) {
      console.error('Login error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
    }
  }

  async callback(ctx) {
    try {
      const { code } = ctx.query;
      
      if (!code) {
        ctx.status = 400;
        ctx.body = { error: 'ไม่พบ authorization code' };
        return;
      }

      // Exchange code for access token
      const tokenData = await facebookConfig.exchangeCodeForToken(code);
      const { access_token } = tokenData;

      // Get user info
      const userInfo = await facebookConfig.getUserInfo(access_token);
      
      // Check if user exists
      let user = await User.findByFacebookId(userInfo.id);
      
      if (!user) {
        // Create new user
        user = await User.create({
          facebookId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          accessToken: access_token
        });
      } else {
        // Update existing user's access token
        await user.update({ 
          accessToken: access_token,
          name: userInfo.name,
          email: userInfo.email
        });
      }

      // Get user's pages
      const pages = await facebookConfig.getUserPages(access_token);
      await user.update({ pages: pages });

      // Store in session
      ctx.session.userId = user.id;
      ctx.session.accessToken = access_token;
      ctx.session.user = user.toJSON();

      ctx.redirect('/dashboard');
    } catch (error) {
      console.error('Callback error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการยืนยันตัวตน: ' + error.message };
    }
  }

  async logout(ctx) {
    try {
      ctx.session = null;
      ctx.redirect('/');
    } catch (error) {
      console.error('Logout error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการออกจากระบบ' };
    }
  }

  async getCurrentUser(ctx) {
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

      ctx.body = { user: user.toJSON() };
    } catch (error) {
      console.error('Get current user error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' };
    }
  }

  async refreshPages(ctx) {
    try {
      if (!ctx.session.userId || !ctx.session.accessToken) {
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

      // Get updated pages from Facebook
      const pages = await facebookConfig.getUserPages(ctx.session.accessToken);
      await user.update({ pages: pages });

      ctx.body = { 
        success: true, 
        message: 'อัปเดตข้อมูลเพจเรียบร้อยแล้ว',
        pages: pages 
      };
    } catch (error) {
      console.error('Refresh pages error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลเพจ: ' + error.message };
    }
  }
}

module.exports = new AuthController();
