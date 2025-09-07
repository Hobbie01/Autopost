// Vercel serverless function for cleanup
// This can be called via cron job or manually
const db = require('../config/database-vercel');

module.exports = async (req, res) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Optional: Add authentication/authorization here
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CLEANUP_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Perform cleanup
    db.cleanup();
    
    res.status(200).json({ 
      success: true, 
      message: 'Cleanup completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      error: 'Cleanup failed', 
      message: error.message 
    });
  }
};
