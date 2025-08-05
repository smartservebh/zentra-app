# 🚀 دليل نشر Zentra على Cloudflare Pages

## 📋 المتطلبات الأساسية
- ✅ حساب Cloudflare نشط
- ✅ المستودع على GitHub: https://github.com/smartservebh/zentra-app.git
- ✅ النطاق zentrahub.pro مربوط بـ Cloudflare

## 🔧 الخطوة 1: الدخول إلى Cloudflare Pages

1. افتح [Cloudflare Dashboard](https://dash.cloudflare.com)
2. سجل دخولك
3. من القائمة الجانبية اليسرى، اضغط على **Pages**

## 🔗 الخطوة 2: إنشاء مشروع جديد

1. اضغط على زر **Create a project**
2. ستظهر لك خيارات، اختر **Connect to Git**

## 🐙 الخطوة 3: ربط GitHub

1. اضغط على **Connect GitHub**
2. إذا لم تكن مسجل دخول في GitHub، سيطلب منك تسجيل الدخول
3. اختر **smartservebh** من قائمة Organizations
4. إذا لم تظهر المنظمة، اض��ط **Configure GitHub App** وأضف الصلاحيات
5. ابحث عن **zentra-app** في قائمة المستودعات
6. اضغط على المستودع لاختياره

## ⚙️ الخطوة 4: إعدادات البناء

املأ الحقول بالقيم التالية بالضبط:

```
Project name: zentra-app
Production branch: main

Build settings:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: / (اتركه فارغ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔐 الخطوة 5: متغيرات البيئة (Environment Variables)

اضغط على **Environment variables** وأضف:

```
NODE_VERSION = 18
FRONTEND_URL = https://zentrahub.pro
API_URL = https://api.zentrahub.pro
```

لإضافة كل متغير:
1. اضغط **Add variable**
2. أدخل الاسم في **Variable name**
3. أدخل القيمة في **Value**
4. اضغط **Add**

## 🚀 الخطوة 6: بدء النشر

1. بعد إضافة جميع الإعدادات، اضغط **Save and Deploy**
2. سيبدأ Cloudflare في:
   - استنساخ المستودع
   - تثبيت المكتب��ت (npm install)
   - تشغيل أمر البناء (npm run build)
   - نشر محتويات مجلد dist

3. انتظر حتى تكتمل العملية (عادة 2-5 دقائق)
4. ستظهر علامة ✅ خضراء عند النجاح

## 🌐 الخطوة 7: إضافة النطاق المخصص

بعد نجاح النشر:

1. اذهب إلى تبويب **Custom domains**
2. اضغط **Set up a custom domain**
3. أدخل `zentrahub.pro` واضغط **Continue**
4. ستظهر رسالة تأكيد، اضغط **Activate domain**

كرر نفس الخطوات لإضافة `www.zentrahub.pro`

## 📡 الخطوة 8: التحقق من DNS

Cloudflare سيضيف تلقائياً سجلات DNS:

```
Type    Name                Value
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CNAME   zentrahub.pro      zentra-app.pages.dev
CNAME   www                zentra-app.pages.dev
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

للتحقق:
1. اذهب إلى **DNS** في Cloudflare Dashboard
2. تأكد من وجود السجلات أعلاه

## 🔒 الخطوة 9: التحقق من SSL

SSL يتم تفعيله تلقائياً�� للتأكد:

1. اذهب إلى **SSL/TLS** → **Overview**
2. تأكد أن الوضع هو **Full** أو **Full (strict)**
3. اذهب إلى **Edge Certificates**
4. تأكد من وجود شهادة لـ zentrahub.pro

## ✅ الخطوة 10: التحقق النهائي

بعد 5-10 دقائق، افتح المتصفح وتحقق من:

- ✅ https://zentrahub.pro - يجب أن يعمل
- ✅ https://www.zentrahub.pro - يجب أن يعمل
- ✅ http://zentrahub.pro - يجب أن يحول تلقائياً إلى HTTPS
- ✅ القفل الأخضر في المتصفح (SSL نشط)

## 🔄 النشر التلقائي

الآن كل مرة تعمل push للكود:

```bash
git add .
git commit -m "تحديث الموقع"
git push origin main
```

سيتم النشر تلقائياً خلال دقائق!

## 🛠️ استكشاف الأخطاء

### إذا فشل البناء:
1. اذهب إلى **Deployments**
2. اضغط على النشر الفاشل
3. اقرأ سجل الأخطاء
4. الأخطاء الشائعة:
   - نسيان `npm install fs-extra`
   - خطأ في مسار الملفات
   - نسخة Node.js خاطئة

### إذا لم يعمل النطاق:
1. انتظر 10-15 دقيقة لانتشار DNS
2. تحقق من سجلات DNS
3. جرب مسح DNS cache: `ipconfig /flushdns`

### إذا ظهرت صفحة 404:
1. تأكد من وجود `_redirects` في dist
2. تأكد من وجود `index.html` في dist
3. أعد البناء والنشر

## 📊 مراقبة الأداء

1. **Analytics**: Pages → zentra-app → Analytics
2. **Web Analytics**: يمكن تفعيلها لمراقبة الزوار
3. **Real User Monitoring**: لمراقبة الأداء الفعلي

## 🎉 تهانينا!

موقع Zentra الآن مباشر على:
- 🌐 https://zentrahub.pro
- 🌐 https://www.zentrahub.pro

مع:
- ✅ SSL/HTTPS كامل
- ✅ CDN عالمي سريع
- ✅ نشر تلقائي من GitHub
- ✅ حماية DDoS من Cloudflare

---

**ملاحظة**: احتفظ بهذا الدليل للرجوع إليه في المستقبل!