const axios = require('axios');

class FacebookConfig {
  constructor() {
    this.apiVersion = process.env.FACEBOOK_API_VERSION || 'v23.0';
    this.appId = process.env.FACEBOOK_APP_ID;
    this.appSecret = process.env.FACEBOOK_APP_SECRET;
    this.redirectUri = process.env.FACEBOOK_REDIRECT_URI || 
      (process.env.NODE_ENV === 'production' 
        ? `https://${process.env.VERCEL_URL}/auth/facebook/callback`
        : 'http://localhost:3000/auth/facebook/callback');
    this.baseUrl = 'https://graph.facebook.com';
  }

  getAuthUrl() {
    const scopes = [
      'pages_manage_posts',
      'pages_read_engagement', 
      'pages_show_list',
      'publish_to_groups'
    ].join(',');

    return `https://www.facebook.com/${this.apiVersion}/dialog/oauth?` +
      `client_id=${this.appId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `scope=${scopes}&` +
      `response_type=code`;
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params: {
          client_id: this.appId,
          client_secret: this.appSecret,
          redirect_uri: this.redirectUri,
          code: code
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,email'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getUserPages(accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/me/accounts`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,access_token,category,picture'
        }
      });

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get user pages: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createScheduledPost(pageId, pageAccessToken, message, scheduledTime) {
    try {
      const scheduledTimestamp = Math.floor(new Date(scheduledTime).getTime() / 1000);
      
      const response = await axios.post(
        `${this.baseUrl}/${this.apiVersion}/${pageId}/feed`,
        {
          message: message,
          published: false,
          scheduled_publish_time: scheduledTimestamp,
          access_token: pageAccessToken
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create scheduled post: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async deletePost(postId, accessToken) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/${this.apiVersion}/${postId}`,
        {
          params: {
            access_token: accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete post: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = new FacebookConfig();
