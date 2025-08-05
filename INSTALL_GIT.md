# 🔧 تثبيت Git ورفع المشروع إلى GitHub

## ❌ Git غير مثبت على النظام

لرفع المشروع إلى GitHub، تحتاج أولاً لتثبيت Git.

## 📥 خطوات تثبيت Git:

### 1. تحميل Git
- افتح الرابط: https://git-scm.com/download/win
- اضغط على **Click here to download** للتحميل التلقائي

### 2. تثبيت Git
1. شغل ملف التثبيت الذي تم تحميله
2. اضغط **Next** على جميع الخيارات (الإعدادات الافتراضية مناسبة)
3. في نهاية التثبيت، اضغط **Finish**

### 3. التحقق من التثبيت
افتح **Command Prompt** أو **PowerShell** جديد واكتب:
```bash
git --version
```
يجب أن تظهر نسخة Git المثبتة.

## 🚀 رفع المشروع إلى GitHub:

### الطريقة 1: استخدام PowerShell Script (مستحسن)
```powershell
# افتح PowerShell كمسؤول
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# شغل السكريبت
.\setup-git-and-push.ps1
```

### الطريقة 2: استخدام Batch File
```cmd
# انقر مرتين على الملف
git-push.bat
```

### الطريقة 3: الأوامر اليدوية
```bash
git init
git remote add origin https://github.com/smartservebh/zentra-app.git
git add .
git commit -m "Initial Zentra upload"
git branch -M main
git push -u origin main
```

## 🔐 المصادقة مع GitHub:

عند تنفيذ `git push`، ستحتاج إلى:

### للمصادقة الحديثة (Personal Access Token):
1. اذهب إلى: https://github.com/settings/tokens
2. اضغط **Generate new token (classic)**
3. أعطه اسم مثل "Zentra Upload"
4. اختر صلاحيات **repo** (كاملة)
5. اضغط **Generate token**
6. انسخ التوكن (لن تراه مرة أخرى!)
7. استخدمه كـ password عند الطلب

### معلومات تسجيل الدخول:
- **Username**: اسم المستخدم في GitHub
- **Password**: Personal Access Token (ليس كلمة المرور العادية!)

## ✅ بعد النجاح:

ستجد المشروع على:
https://github.com/smartservebh/zentra-app

## 🆘 مشاكل شائعة:

### "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/smartservebh/zentra-app.git
```

### "error: failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### "Permission denied"
- تأكد من استخدام Personal Access Token
- تأكد من أن لديك صلاحيات على المستودع

---

**ملاحظة**: بعد تثبيت Git، أعد فتح terminal جديد قبل تشغيل الأوامر!