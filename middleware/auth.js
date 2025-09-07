const User = require('../models/User');

// Middleware to check if user is authenticated
const requireAuth = async (ctx, next) => {
  try {
    if (!ctx.session.userId) {
      if (ctx.request.accepts('json')) {
        ctx.status = 401;
        ctx.body = { error: 'ไม่ได้เข้าสู่ระบบ' };
        return;
      } else {
        ctx.redirect('/auth/facebook');
        return;
      }
    }

    const user = await User.findById(ctx.session.userId);
    if (!user) {
      ctx.session = null;
      if (ctx.request.accepts('json')) {
        ctx.status = 401;
        ctx.body = { error: 'ไม่พบผู้ใช้' };
        return;
      } else {
        ctx.redirect('/auth/facebook');
        return;
      }
    }

    ctx.state.user = user;
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    ctx.status = 500;
    ctx.body = { error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' };
  }
};

// Middleware to check if user has pages
const requirePages = async (ctx, next) => {
  try {
    const user = ctx.state.user;
    
    if (!user || !user.pages || user.pages.length === 0) {
      if (ctx.request.accepts('json')) {
        ctx.status = 400;
        ctx.body = { error: 'ไม่พบเพจที่เชื่อมต่อ กรุณาเชื่อมต่อเพจก่อน' };
        return;
      } else {
        ctx.redirect('/dashboard?error=no_pages');
        return;
      }
    }

    await next();
  } catch (error) {
    console.error('Require pages middleware error:', error);
    ctx.status = 500;
    ctx.body = { error: 'เกิดข้อผิดพลาดในการตรวจสอบเพจ' };
  }
};

// Middleware to validate request data
const validateRequest = (schema) => {
  return async (ctx, next) => {
    try {
      const { error, value } = schema.validate(ctx.request.body);
      
      if (error) {
        ctx.status = 400;
        ctx.body = { 
          error: 'ข้อมูลไม่ถูกต้อง', 
          details: error.details.map(detail => detail.message) 
        };
        return;
      }

      ctx.request.body = value;
      await next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      ctx.status = 500;
      ctx.body = { error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' };
    }
  };
};

// Middleware to handle errors
const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);
    
    ctx.status = error.status || 500;
    ctx.body = {
      error: error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
  }
};

// Middleware to log requests
const requestLogger = async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  
  console.log(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
};

module.exports = {
  requireAuth,
  requirePages,
  validateRequest,
  errorHandler,
  requestLogger
};
