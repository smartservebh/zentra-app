# MongoDB Shell (mongosh) Setup Guide

## 🚨 المشكلة الحالية

يواجه تثبيت `mongosh` مشاكل بسبب:
- ملفات npm cache مقفلة (EBUSY errors)
- عدم وجود Visual Studio C++ Build Tools
- تعارض مع Node.js v22

## ✅ الحلول المتاحة

### الحل 1: استخدام MongoDB Compass (موصى به للمبتدئين)

1. حمل MongoDB Compass من: https://www.mongodb.com/products/compass
2. ثبت البرنامج
3. اتصل بـ `mongodb://localhost:27017/zentra`

### الحل 2: تثبيت Visual C++ Build Tools

1. حمل Build Tools من: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
2. ثبت مع خيار "Desktop development with C++"
3. أعد تشغيل الكمبيوتر
4. شغل كـ Administrator:
   ```bash
   npm install -g mongosh
   ```

### الحل 3: تحميل mongosh مباشرة (بدون npm)

1. اذهب إلى: https://www.mongodb.com/try/download/shell
2. حمل النسخة المناسبة لـ Windows
3. فك الضغط في مجلد مثل `C:\mongosh`
4. أضف الم��لد إلى PATH:
   - افتح System Properties > Environment Variables
   - أضف `C:\mongosh\bin` إلى PATH
5. أعد تشغيل Terminal

### الحل 4: استخدام Wrapper Script (حل مؤقت)

استخدم السكريبت المرفق:
```bash
# من داخل مجلد المشروع
mongosh.bat

# أو
node scripts/mongosh-wrapper.js
```

## 🛠️ تنظيف npm cache

إذا أردت المحاولة مرة أخرى:

1. **أغلق كل البرامج** (VS Code, Terminal, etc.)

2. **شغل كـ Administrator**:
   ```bash
   # نظف الكاش
   scripts\force-clean-npm.bat
   
   # أو يدوياً
   taskkill /F /IM node.exe
   rd /s /q "%USERPROFILE%\AppData\Local\npm-cache"
   npm cache clean --force
   ```

3. **أعد المحاولة**:
   ```bash
   npm install -g mongosh
   ```

## 📝 Scripts المتوفرة

```bash
# محاولة إعداد mongosh
npm run setup-mongosh

# اختبار mongosh
npm run test-mongosh

# تنظيف npm cache
npm run clean-npm-cache

# فتح MongoDB shell
npm run db:shell
```

## 🔍 التحقق من MongoDB

للتأكد أن MongoDB يعمل:
```bash
# Windows Service
sc query MongoDB

# أو تحقق من المنفذ
netstat -an | findstr :27017
```

## 💡 نصائح

1. **استخدم MongoDB Compass** ل��واجهة الرسومية
2. **Studio 3T** بديل ممتاز آخر
3. **MongoDB for VS Code** extension مفيد جداً

## 🚀 البدء السريع بدون mongosh

يمكنك تشغيل Zentra بدون mongosh:
```bash
# تأكد أن MongoDB يعمل
# ثم شغل التطبيق
npm start
```

التطبيق سيتصل بـ MongoDB تلقائياً عبر Mongoose.