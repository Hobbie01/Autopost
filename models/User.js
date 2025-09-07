const db = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.facebookId = data.facebookId;
    this.name = data.name;
    this.email = data.email;
    this.accessToken = data.accessToken;
    this.pages = data.pages || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async create(userData) {
    const user = db.addUser(userData);
    return new User(user);
  }

  static async findById(id) {
    const userData = db.getUserById(id);
    return userData ? new User(userData) : null;
  }

  static async findByFacebookId(facebookId) {
    const userData = db.getUserByFacebookId(facebookId);
    return userData ? new User(userData) : null;
  }

  async update(updates) {
    const updatedUser = db.updateUser(this.id, updates);
    if (updatedUser) {
      Object.assign(this, updatedUser);
      this.updatedAt = new Date().toISOString();
    }
    return updatedUser;
  }

  async addPage(pageData) {
    const existingPageIndex = this.pages.findIndex(page => page.id === pageData.id);
    
    if (existingPageIndex !== -1) {
      this.pages[existingPageIndex] = { ...this.pages[existingPageIndex], ...pageData };
    } else {
      this.pages.push(pageData);
    }
    
    await this.update({ pages: this.pages });
    return this.pages;
  }

  async removePage(pageId) {
    this.pages = this.pages.filter(page => page.id !== pageId);
    await this.update({ pages: this.pages });
    return this.pages;
  }

  getPageById(pageId) {
    return this.pages.find(page => page.id === pageId);
  }

  getPagesByCategory(category) {
    return this.pages.filter(page => page.category === category);
  }

  toJSON() {
    return {
      id: this.id,
      facebookId: this.facebookId,
      name: this.name,
      email: this.email,
      pages: this.pages,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
