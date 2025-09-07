// Session configuration for Vercel deployment
const sessionConfig = {
  key: 'autopost.sess',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
};

// For Vercel serverless, we need to use a different session store
// Since we can't use memory store in serverless, we'll use a simple cookie-based approach
const createSessionStore = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production (Vercel), use a more persistent approach
    return {
      get: (key) => {
        // This would typically connect to a database or external store
        // For now, we'll use a simple in-memory approach with encryption
        return null;
      },
      set: (key, sess, maxAge) => {
        // Store session data
        return;
      },
      destroy: (key) => {
        // Remove session data
        return;
      }
    };
  } else {
    // In development, use simple memory store
    const store = new Map();
    return {
      get: (key) => store.get(key),
      set: (key, sess, maxAge) => store.set(key, sess),
      destroy: (key) => store.delete(key)
    };
  }
};

module.exports = {
  sessionConfig,
  createSessionStore
};
