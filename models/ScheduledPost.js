const db = require('../config/database');

class ScheduledPost {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.originalText = data.originalText;
    this.enhancedContent = data.enhancedContent;
    this.scheduledTime = data.scheduledTime;
    this.status = data.status || 'scheduled'; // scheduled, published, failed, cancelled
    this.results = data.results || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async create(postData) {
    const post = db.addScheduledPost(postData);
    return new ScheduledPost(post);
  }

  static async findById(id) {
    const postData = db.getScheduledPostById(id);
    return postData ? new ScheduledPost(postData) : null;
  }

  static async findAll() {
    const posts = db.getScheduledPosts();
    return posts.map(post => new ScheduledPost(post));
  }

  static async findByUserId(userId) {
    const posts = db.getScheduledPosts();
    return posts
      .filter(post => post.userId === userId)
      .map(post => new ScheduledPost(post));
  }

  static async findByStatus(status) {
    const posts = db.getScheduledPosts();
    return posts
      .filter(post => post.status === status)
      .map(post => new ScheduledPost(post));
  }

  async update(updates) {
    const updatedPost = db.updateScheduledPost(this.id, updates);
    if (updatedPost) {
      Object.assign(this, updatedPost);
      this.updatedAt = new Date().toISOString();
    }
    return updatedPost;
  }

  async delete() {
    const deletedPost = db.deleteScheduledPost(this.id);
    return deletedPost;
  }

  addResult(result) {
    this.results.push({
      ...result,
      timestamp: new Date().toISOString()
    });
    return this.results;
  }

  updateResult(pageId, updates) {
    const resultIndex = this.results.findIndex(result => result.pageId === pageId);
    if (resultIndex !== -1) {
      this.results[resultIndex] = { ...this.results[resultIndex], ...updates };
    }
    return this.results;
  }

  getResultsByStatus(status) {
    return this.results.filter(result => result.status === status);
  }

  getSuccessfulResults() {
    return this.getResultsByStatus('scheduled');
  }

  getFailedResults() {
    return this.getResultsByStatus('failed');
  }

  isScheduled() {
    return this.status === 'scheduled';
  }

  isPublished() {
    return this.status === 'published';
  }

  isFailed() {
    return this.status === 'failed';
  }

  isCancelled() {
    return this.status === 'cancelled';
  }

  canBeCancelled() {
    return this.isScheduled() && new Date(this.scheduledTime) > new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      originalText: this.originalText,
      enhancedContent: this.enhancedContent,
      scheduledTime: this.scheduledTime,
      status: this.status,
      results: this.results,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = ScheduledPost;
