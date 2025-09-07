// Database configuration optimized for Vercel serverless
const crypto = require('crypto');

class VercelDatabase {
  constructor() {
    // Use environment variables for persistence in Vercel
    this.scheduledPosts = this.loadFromEnv('SCHEDULED_POSTS') || [];
    this.users = this.loadFromEnv('USERS') || [];
    this.sessions = this.loadFromEnv('SESSIONS') || {};
  }

  // Simple encryption for sensitive data
  encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.SESSION_SECRET || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(process.env.SESSION_SECRET || 'default-key', 'salt', 32);
      const textParts = encryptedText.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encrypted = textParts.join(':');
      const decipher = crypto.createDecipher(algorithm, key);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      return null;
    }
  }

  loadFromEnv(key) {
    try {
      const data = process.env[key];
      if (data) {
        const decrypted = this.decrypt(data);
        return decrypted ? JSON.parse(decrypted) : null;
      }
      return null;
    } catch (error) {
      console.error(`Error loading ${key} from env:`, error);
      return null;
    }
  }

  saveToEnv(key, data) {
    try {
      const encrypted = this.encrypt(JSON.stringify(data));
      // In Vercel, we can't directly modify environment variables
      // This is a limitation of serverless functions
      // In production, you should use a proper database like MongoDB, PostgreSQL, or Redis
      console.log(`Would save ${key} to environment (not implemented in serverless)`);
    } catch (error) {
      console.error(`Error saving ${key} to env:`, error);
    }
  }

  // Scheduled Posts
  addScheduledPost(post) {
    const postWithId = {
      id: Date.now() + Math.random(),
      ...post,
      createdAt: new Date().toISOString()
    };
    this.scheduledPosts.push(postWithId);
    this.saveToEnv('SCHEDULED_POSTS', this.scheduledPosts);
    return postWithId;
  }

  getScheduledPosts() {
    return this.scheduledPosts;
  }

  getScheduledPostById(id) {
    return this.scheduledPosts.find(post => post.id === id);
  }

  deleteScheduledPost(id) {
    const index = this.scheduledPosts.findIndex(post => post.id === id);
    if (index !== -1) {
      const deleted = this.scheduledPosts.splice(index, 1)[0];
      this.saveToEnv('SCHEDULED_POSTS', this.scheduledPosts);
      return deleted;
    }
    return null;
  }

  updateScheduledPost(id, updates) {
    const index = this.scheduledPosts.findIndex(post => post.id === id);
    if (index !== -1) {
      this.scheduledPosts[index] = { ...this.scheduledPosts[index], ...updates };
      this.saveToEnv('SCHEDULED_POSTS', this.scheduledPosts);
      return this.scheduledPosts[index];
    }
    return null;
  }

  // Users
  addUser(user) {
    const userWithId = {
      id: Date.now() + Math.random(),
      ...user,
      createdAt: new Date().toISOString()
    };
    this.users.push(userWithId);
    this.saveToEnv('USERS', this.users);
    return userWithId;
  }

  getUserById(id) {
    return this.users.find(user => user.id === id);
  }

  getUserByFacebookId(facebookId) {
    return this.users.find(user => user.facebookId === facebookId);
  }

  updateUser(id, updates) {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      this.saveToEnv('USERS', this.users);
      return this.users[index];
    }
    return null;
  }

  // Sessions
  setSession(sessionId, data) {
    this.sessions[sessionId] = {
      ...data,
      createdAt: new Date().toISOString()
    };
    this.saveToEnv('SESSIONS', this.sessions);
  }

  getSession(sessionId) {
    return this.sessions[sessionId];
  }

  deleteSession(sessionId) {
    delete this.sessions[sessionId];
    this.saveToEnv('SESSIONS', this.sessions);
  }

  // Cleanup old data
  cleanup() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Clean old scheduled posts
    this.scheduledPosts = this.scheduledPosts.filter(post => 
      new Date(post.createdAt) > sevenDaysAgo
    );

    // Clean old sessions (older than 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    Object.keys(this.sessions).forEach(sessionId => {
      if (new Date(this.sessions[sessionId].createdAt) < oneDayAgo) {
        delete this.sessions[sessionId];
      }
    });

    this.saveToEnv('SCHEDULED_POSTS', this.scheduledPosts);
    this.saveToEnv('SESSIONS', this.sessions);
  }
}

module.exports = new VercelDatabase();
