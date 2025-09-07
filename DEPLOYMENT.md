# 🚀 คู่มือการ Deploy บน Vercel

## 📋 ข้อกำหนดเบื้องต้น

1. **บัญชี Vercel** - สมัครที่ [vercel.com](https://vercel.com)
2. **บัญชี GitHub** - สำหรับเชื่อมต่อ repository
3. **Facebook App** - ตั้งค่า Facebook Developer App
4. **OpenAI API Key** - สำหรับ AI content generation

## 🔧 การตั้งค่า Environment Variables

### 1. Facebook App Configuration
```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=https://your-app.vercel.app/auth/facebook/callback
FACEBOOK_API_VERSION=v23.0
```

### 2. OpenAI Configuration
```env
OPENAI_API_KEY=your_openai_api_key
```

### 3. Server Configuration
```env
NODE_ENV=production
SESSION_SECRET=your_very_secure_session_secret_key
CLEANUP_SECRET=your_cleanup_secret_key
```

## 📱 การตั้งค่า Facebook App

### 1. สร้าง Facebook App
1. ไปที่ [Facebook Developers](https://developers.facebook.com/)
2. คลิก "Create App"
3. เลือก "Consumer" หรือ "Business"
4. กรอกข้อมูล App

### 2. เพิ่ม Facebook Login
1. ใน App Dashboard เลือก "Add Product"
2. เพิ่ม "Facebook Login"
3. ตั้งค่า "Valid OAuth Redirect URIs":
   ```
   https://your-app.vercel.app/auth/facebook/callback
   ```

### 3. ตั้งค่า Permissions
เพิ่ม permissions ต่อไปนี้:
- `pages_manage_posts`
- `pages_read_engagement`
- `pages_show_list`
- `publish_to_groups`

### 4. ตั้งค่า App Review (ถ้าจำเป็น)
- สำหรับ production ต้องส่ง App Review
- สำหรับ development ใช้ test users

## 🚀 การ Deploy บน Vercel

### วิธีที่ 1: Deploy จาก GitHub (แนะนำ)

1. **Push โค้ดไป GitHub**
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

2. **เชื่อมต่อกับ Vercel**
   - เข้า [Vercel Dashboard](https://vercel.com/dashboard)
   - คลิก "New Project"
   - เลือก GitHub repository
   - คลิก "Import"

3. **ตั้งค่า Environment Variables**
   - ใน Vercel Dashboard ไปที่ Project Settings
   - เลือก "Environment Variables"
   - เพิ่มตัวแปรทั้งหมดตามที่ระบุข้างต้น

4. **Deploy**
   - คลิก "Deploy"
   - รอให้ deployment เสร็จ

### วิธีที่ 2: Deploy ด้วย Vercel CLI

1. **ติดตั้ง Vercel CLI**
```bash
npm i -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **ตั้งค่า Environment Variables**
```bash
vercel env add FACEBOOK_APP_ID
vercel env add FACEBOOK_APP_SECRET
vercel env add OPENAI_API_KEY
vercel env add SESSION_SECRET
vercel env add CLEANUP_SECRET
```

## 🔄 การตั้งค่า Auto-Deploy

1. **เชื่อมต่อ GitHub Repository**
2. **ตั้งค่า Branch Protection**
   - ไปที่ GitHub Repository Settings
   - เลือก "Branches"
   - เพิ่ม rule สำหรับ main branch

3. **Vercel จะ auto-deploy เมื่อ:**
   - Push code ไป main branch
   - Create Pull Request
   - Merge Pull Request

## 🛠️ การตั้งค่า Custom Domain (ถ้าต้องการ)

1. **ใน Vercel Dashboard**
   - ไปที่ Project Settings
   - เลือก "Domains"
   - เพิ่ม domain ของคุณ

2. **ตั้งค่า DNS**
   - เพิ่ม CNAME record ชี้ไป Vercel
   - หรือใช้ A record ตามที่ Vercel แนะนำ

## 📊 การ Monitor และ Debug

### 1. Vercel Analytics
- เปิดใช้งานใน Project Settings
- ดู performance metrics

### 2. Function Logs
```bash
vercel logs
```

### 3. Environment Variables
```bash
vercel env ls
```

## 🔧 การตั้งค่า Cleanup Job

### 1. ใช้ Vercel Cron Jobs
สร้างไฟล์ `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 2. ใช้ External Cron Service
- ตั้งค่า cron job ที่เรียก `https://your-app.vercel.app/api/cleanup`
- ใช้ `CLEANUP_SECRET` สำหรับ authentication

## 🚨 Troubleshooting

### ปัญหาที่พบบ่อย

1. **Facebook Login ไม่ทำงาน**
   - ตรวจสอบ `FACEBOOK_REDIRECT_URI`
   - ตรวจสอบ Facebook App settings
   - ตรวจสอบ permissions

2. **Session ไม่ persist**
   - ตรวจสอบ `SESSION_SECRET`
   - ตรวจสอบ cookie settings

3. **OpenAI API Error**
   - ตรวจสอบ `OPENAI_API_KEY`
   - ตรวจสอบ API quota

4. **Function Timeout**
   - ตรวจสอบ `maxDuration` ใน `vercel.json`
   - Optimize code performance

### Debug Commands
```bash
# ดู logs
vercel logs

# ดู environment variables
vercel env ls

# Test locally
vercel dev
```

## 📈 Performance Optimization

1. **ใช้ Edge Functions** สำหรับ static content
2. **Optimize images** และ assets
3. **ใช้ CDN** สำหรับ static files
4. **Monitor function execution time**

## 🔒 Security Best Practices

1. **ใช้ HTTPS** เสมอ
2. **ตั้งค่า secure cookies**
3. **Validate input** ทุกครั้ง
4. **ใช้ environment variables** สำหรับ secrets
5. **ตั้งค่า CORS** ให้เหมาะสม

## 📞 Support

หากมีปัญหาการ deploy:
1. ตรวจสอบ [Vercel Documentation](https://vercel.com/docs)
2. ดู [Vercel Community](https://github.com/vercel/vercel/discussions)
3. สร้าง issue ใน repository นี้
