# Zentra - منصة تحويل الأفكار إلى تطبيقات ويب فورية

<div dir="rtl">

## 🌟 نظرة عامة

**Zentra** هي منصة SaaS متطورة تحول الأوصاف النصية باللغة العربية أو الإنجليزية إلى تطبيقات ويب كاملة وعملية فوراً، دون الحاجة لأي معرفة برمجية.

</div>

## ✨ Features / المميزات

### 🚀 Core Features
- **AI-Powered Generation**: Uses OpenAI GPT-4 to understand and generate complete web applications
- **Bilingual Support**: Full support for Arabic and English prompts and interfaces
- **Instant Results**: Generate working apps in seconds
- **No-Code Platform**: Zero coding knowledge required
- **Responsive Design**: All generated apps work perfectly on all devices

### 💼 Business Features
- **User Authentication**: Secure signup/login system with JWT
- **Subscription Plans**: Free, Pro, and Team tiers
- **App Management**: Dashboard to manage all generated apps
- **Publishing System**: Share apps with public URLs
- **Admin Panel**: Complete control over users and plans

### 🎨 UI/UX Features
- **Modern Interface**: Clean, professional design with smooth animations
- **Interactive Buttons**: Enhanced button interactions with hover effects
- **Clear Typography**: Improved text clarity and readability
- **RTL Support**: Full right-to-left support for Arabic
- **Dark Mode Ready**: Infrastructure for theme switching

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **OpenAI API** (GPT-4) for app generation
- **JWT** for authentication
- **Bcrypt** for password hashing

### Frontend
- **Vanilla JavaScript** (no framework dependencies)
- **Modern CSS3** with animations
- **Responsive Design** with mobile-first approach
- **Arabic/English** language switching

### Security
- **Helmet.js** for security headers
- **Rate Limiting** to prevent abuse
- **Input Validation** with express-validator
- **CORS** protection

## 📁 Project Structure

```
zentra-app/
├── api/                    # API routes
│   ├── auth.js            # Authentication endpoints
│   ├── apps.js            # App generation endpoints
│   ├── users.js           # User management
│   └── admin.js           # Admin endpoints
├── models/                # Database models
│   ├── User.js           # User schema
│   └── App.js            # App schema
├── middleware/           # Express middleware
│   └── auth.js          # Authentication middleware
├── services/            # Business logic
│   └── appGenerator.js  # OpenAI integration
├── public/              # Frontend files
│   ├── index.html       # Homepage
│   ├── login.html       # Login page
│   ├── register.html    # Registration page
│   ├── dashboard.html   # User dashboard
│   ├── admin.html       # Admin panel
│   ├── styles/          # CSS files
│   ├── js/              # JavaScript files
│   └── assets/          # Images and icons
├── generated-apps/      # Storage for generated apps
├── .env                 # Environment variables
├── server.js           # Main server file
└── package.json        # Dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/zentra-app.git
cd zentra-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/zentra

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_secret_key_here

# Session Configuration
SESSION_SECRET=your_session_secret_here
```

4. Start MongoDB:
```bash
mongod
```

5. Run the application:
```bash
npm start
```

6. Open your browser:
```
http://localhost:3000
```

## 📱 Usage

### For Users
1. **Sign Up**: Create a free account
2. **Describe Your App**: Write what you want in Arabic or English
3. **Generate**: Click generate and wait a few seconds
4. **Preview**: See your app running instantly
5. **Publish**: Share your app with a public URL

### For Admins
1. Access admin panel at `/admin`
2. Manage users and subscription plans
3. View analytics and usage statistics
4. Control app generation limits

## 💳 Pricing Plans

### Free Plan
- 3 apps per month
- Basic templates
- Public sharing
- Community support

### Pro Plan ($19/month)
- 50 apps per month
- Advanced templates
- Custom domains
- Priority support
- Analytics dashboard

### Team Plan ($49/month)
- Unlimited apps
- Team collaboration
- White-label options
- 24/7 support
- API access

## 🔒 Security Features

- **Password Hashing**: Bcrypt with 12 rounds
- **JWT Tokens**: Secure authentication
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all inputs
- **HTTPS Ready**: SSL/TLS support
- **XSS Protection**: Content Security Policy

## 🌍 Internationalization

The platform fully supports:
- **Arabic (RTL)**: Complete right-to-left interface
- **English (LTR)**: Standard left-to-right interface
- **Dynamic Switching**: Change language anytime
- **Localized Content**: All text properly translated

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### App Generation
- `POST /api/apps/generate` - Generate new app
- `GET /api/apps/my-apps` - Get user's apps
- `GET /api/apps/:appId` - Get specific app
- `PUT /api/apps/:appId` - Update app
- `DELETE /api/apps/:appId` - Delete app
- `PATCH /api/apps/:appId/publish` - Publish/unpublish app

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:userId` - Update user
- `GET /api/admin/stats` - Platform statistics

## 🎨 UI Components

### Interactive Buttons
- Gradient backgrounds on hover
- Transform animations (lift effect)
- Enhanced shadows and glow
- Shimmer effects for CTAs
- Pulse animations for important actions

### Text Clarity
- Improved contrast ratios
- Better font weights
- Enhanced readability
- Accessible color choices

## 🚧 Deployment

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure production MongoDB
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring (PM2, etc.)
- [ ] Configure backup strategy
- [ ] Set up CDN for static assets

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=https://zentra.app
RATE_LIMIT_MAX_REQUESTS=50
```

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- MongoDB team
- Express.js community
- All contributors

## 📞 Support

- Email: support@zentra.app
- Documentation: docs.zentra.app
- Community: community.zentra.app

---

<div dir="rtl">

## 🎯 الحالة الحالية

تم إنجاز المشروع بنجاح مع جميع المميزات المطلوبة:

✅ **الواجهة الأمامية**: كاملة مع جميع الصفحات والتصاميم
✅ **الواجهة الخلفية**: API كامل مع المصادقة وإدارة المستخدمين
✅ **تكامل OpenAI**: جاهز للاستخدام مع GPT-4
✅ **قاعدة البيانات**: نماذج MongoDB كاملة
✅ **الأمان**: جميع الممارسات الأمنية مطبقة
✅ **التصميم التفاعلي**: أزرار تفاعلية ونصوص واضحة
✅ **دعم اللغتين**: عربي وإنجليزي بالكامل

</div>

---

**Built with ❤️ by the Zentra Team**