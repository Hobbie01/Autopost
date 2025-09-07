# ระบบโพสต์อัตโนมัติ Facebook

ระบบจัดการโพสต์ Facebook อัตโนมัติ พร้อม AI ปรับปรุงเนื้อหา โดยใช้ Koa Framework และหลักการ MVC

## ✨ ฟีเจอร์หลัก

- 🔐 **Facebook Login** - เข้าสู่ระบบด้วย Facebook
- 📝 **AI ปรับปรุงเนื้อหา** - ใช้ OpenAI ปรับปรุงเนื้อหาให้น่าสนใจ
- ⏰ **โพสต์ตามเวลา** - ตั้งเวลาโพสต์ล่วงหน้าได้
- 📱 **จัดการหลายเพจ** - โพสต์ไปยังเพจ Facebook หลายเพจพร้อมกัน
- 📊 **แดชบอร์ด** - ดูสถิติและจัดการโพสต์
- 🎯 **สร้างเนื้อหาทางเลือก** - AI สร้างเนื้อหาหลายแบบให้เลือก

## 🏗️ โครงสร้างโปรเจค (MVC)

```
├── app.js                 # Main application file
├── package.json           # Dependencies
├── env.example           # Environment variables template
├── config/               # Configuration files
│   ├── database.js       # Database configuration
│   └── facebook.js       # Facebook API configuration
├── controllers/          # Controllers (Business Logic)
│   ├── AuthController.js
│   ├── PostController.js
│   └── DashboardController.js
├── models/               # Models (Data Layer)
│   ├── User.js
│   └── ScheduledPost.js
├── views/                # Views (Presentation Layer)
│   ├── index.ejs
│   └── dashboard.ejs
├── routes/               # Routes (Routing Layer)
│   ├── index.js
│   ├── auth.js
│   ├── posts.js
│   └── dashboard.js
├── services/             # Services (External APIs)
│   └── OpenAIService.js
└── middleware/           # Middleware
    └── auth.js
```

## 🚀 การติดตั้ง

1. **Clone โปรเจค**
```bash
git clone <repository-url>
cd autopost
```

2. **ติดตั้ง Dependencies**
```bash
npm install
```

3. **ตั้งค่า Environment Variables**
```bash
cp env.example .env
```

แก้ไขไฟล์ `.env`:
```env
# Facebook App Configuration
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/auth/facebook/callback

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=3000
SESSION_SECRET=your_session_secret_key

# Facebook API Version
FACEBOOK_API_VERSION=v23.0
```

4. **รันเซิร์ฟเวอร์**
```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 การตั้งค่า Facebook App

1. ไปที่ [Facebook Developers](https://developers.facebook.com/)
2. สร้าง App ใหม่
3. เพิ่ม Facebook Login Product
4. ตั้งค่า Valid OAuth Redirect URIs: `http://localhost:3000/auth/facebook/callback`
5. เพิ่ม Permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`

## 🤖 การตั้งค่า OpenAI

1. ไปที่ [OpenAI Platform](https://platform.openai.com/)
2. สร้าง API Key
3. เพิ่ม API Key ในไฟล์ `.env`

## 📱 การใช้งาน

1. เข้าไปที่ `http://localhost:3000`
2. คลิก "เข้าสู่ระบบด้วย Facebook"
3. อนุญาตการเข้าถึงเพจ
4. เริ่มสร้างโพสต์อัตโนมัติ!

## 🛠️ API Endpoints

### Authentication
- `GET /auth/facebook` - Facebook Login
- `GET /auth/facebook/callback` - Facebook Callback
- `GET /auth/logout` - Logout
- `GET /auth/me` - Get current user
- `POST /auth/refresh-pages` - Refresh pages

### Posts
- `POST /api/posts/schedule` - Create scheduled post
- `GET /api/posts/scheduled` - Get scheduled posts
- `GET /api/posts/scheduled/:id` - Get specific post
- `DELETE /api/posts/scheduled/:id` - Delete post
- `POST /api/posts/generate-variations` - Generate content variations
- `POST /api/posts/analyze` - Analyze content

### Dashboard
- `GET /dashboard` - Dashboard page
- `GET /api/dashboard` - Dashboard data
- `GET /api/dashboard/analytics` - Page analytics

## 🔒 Security Features

- Session-based authentication
- Input validation
- Error handling
- Rate limiting (recommended for production)

## 📈 การปรับปรุงในอนาคต

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Content templates
- [ ] Bulk operations
- [ ] API rate limiting
- [ ] Logging system

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

หากมีปัญหาหรือข้อสงสัย กรุณาสร้าง Issue ใน GitHub repository
