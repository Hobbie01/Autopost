// Simple in-memory database for this project
// In production, you might want to use MongoDB, PostgreSQL, etc.

class Database {
  constructor() {
    this.scheduledPosts = [];
    this.users = [];
    this.sessions = {};
  }

  // Scheduled Posts
  addScheduledPost(post) {
    const postWithId = {
      id: Date.now() + Math.random(),
      ...post,
      createdAt: new Date().toISOString()
    };
    this.scheduledPosts.push(postWithId);
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
      return this.scheduledPosts.splice(index, 1)[0];
    }
    return null;
  }

  updateScheduledPost(id, updates) {
    const index = this.scheduledPosts.findIndex(post => post.id === id);
    if (index !== -1) {
      this.scheduledPosts[index] = { ...this.scheduledPosts[index], ...updates };
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
  }

  getSession(sessionId) {
    return this.sessions[sessionId];
  }

  deleteSession(sessionId) {
    delete this.sessions[sessionId];
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
  }
}

module.exports = new Database();
