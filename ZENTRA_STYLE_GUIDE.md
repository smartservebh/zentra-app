# 🎨 Zentra Style Guide - الهوية البصرية والتصميم

## ✅ **1. الطابع العام**

- **أسلوب حديث، راقٍ، ونظيف** (Modern Clean UI)
- **موجه لغير المبرمجين**: واضح وسهل الاستخدام من أول نظرة
- **ثقة + تقنية + بساطة**

---

## 🟢 **2. لوحة الألوان (Color Palette)**

| اللون | الاستخدام الرئيسي | CSS Variable |
|--------|------------------|--------------|
| 🟩 **Neon Green** `#00FF88` | اللون الأساسي للعناصر (أزرار، تفاعل) | `--neon-green` |
| ⚫ **Black** `#0F0F0F` | الخلفية العامة | `--black` |
| ⚪ **White** `#FFFFFF` | النصوص والعناصر الأساسية | `--white` |
| 🟢 **Deep Green** `#007a5e` | العناوين + الظلال | `--deep-green` |
| ⚪ **Light Gray** `#F2F2F2` | خلفيات ثانوية، حدود | `--light-gray` |

### تأثيرات التوهج:
- `--zentra-glow: rgba(0, 255, 136, 0.3)` - توهج عادي
- `--zentra-glow-strong: rgba(0, 255, 136, 0.5)` - توهج قوي
- `--zentra-glow-soft: rgba(0, 255, 136, 0.1)` - توهج خفيف

### التدرجات:
- `--zentra-gradient: linear-gradient(135deg, #00FF88 0%, #33ff99 100%)`
- `--zentra-gradient-reverse: linear-gradient(135deg, #33ff99 0%, #00FF88 100%)`

---

## 🖋️ **3. الخطوط (Typography)**

### الخطوط المستخدمة:
- **الخط العربي:** `Cairo` (الأساسي) أو `Tajawal` (البديل)
- **الخط الإنجليزي:** `Inter` (الأساسي) أو `Poppins` (البديل)

### الأوزان:
- **700** للعناوين الرئيسية
- **600** للعناوين الفرعية والأزرار
- **500** للنصوص المهمة
- **400** للنصوص العادية

### تطبيق الخطوط:
```css
[dir="rtl"] {
    font-family: 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, sans-serif;
}

[dir="ltr"] {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

---

## 💠 **4. عناصر التصميم**

### الأزرار:
- ✅ **أزرار كبيرة** بحواف دائر��ة (`border-radius: 12px`)
- ✅ **تأثيرات Hover ناعمة** (توهج أخضر عند التمرير)
- ✅ **تأثير Shimmer** للأزرار الأساسية
- ✅ **حركة رفع** (`translateY(-2px)`) عند التفاعل

### الأزرار الأساسية:
```css
.btn-primary {
    background: linear-gradient(135deg, var(--neon-green) 0%, var(--primary-light) 100%);
    color: var(--black);
    border-color: var(--neon-green);
    box-shadow: 0 4px 15px var(--zentra-glow);
    font-weight: 700;
}

.btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px var(--zentra-glow-strong);
}
```

### التفاعلات الدقيقة (Micro-interactions):
- ✅ **تأثيرات Micro-interaction** عند الضغط والتحميل
- ✅ **Loading spinner أخضر متوهج**
- ✅ **انتقالات سلسة** (`transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`)

### البطاقات والعناصر:
- ✅ **واجهات مبنية على grid / flexbox** بشكل منظم
- ✅ **حواف دائرية كبيرة** (`border-radius: 16px-20px`)
- ✅ **ظلال ناعمة** مع تأثيرات التوهج

---

## 📱 **5. التوافقية (Responsiveness)**

### التصميم متجاوب بنسبة 100%:

#### 📱 **الجوال:**
- كل العناصر مركزية وكبيرة وسهلة الضغط
- أزرار بحد أدنى `44px` للمس
- نصوص بحجم `16px` لتجنب التكبير التلقائي في iOS

#### 💻 **الكمبيوتر:**
- واجهة منظمة في أعمدة ومربعات
- استخدام Grid Layout لل��خطيطات المعقدة
- تأثيرات Hover متقدمة

### نقاط التوقف:
```css
/* Mobile First */
@media (max-width: 768px) { /* Mobile */ }
@media (min-width: 769px) and (max-width: 1024px) { /* Tablet */ }
@media (min-width: 1025px) { /* Desktop */ }
```

---

## 🌐 **6. واجهة المستخدم العربي**

### دعم RTL/LTR:
- ✅ **كل شيء يدعم RTL وLTR** بشكل تلقائي
- ✅ **الزر الرئيسي لتبديل اللغة** يظهر أعلى اليمين دائمًا
- ✅ **النصوص تترجم بدقة** للغتين، دون فقدان ترتيب أو تصميم

### تطبيق RTL:
```css
[dir="rtl"] .btn-primary::before {
    left: 100%;
}

[dir="rtl"] .btn-primary:hover::before {
    left: -100%;
}
```

### زر تبديل اللغة:
```css
.lang-toggle {
    background: var(--light-gray);
    border: 2px solid #d4d4d4;
    border-radius: 10px;
    padding: 0.5rem 1rem;
    font-weight: 600;
    color: var(--deep-green);
    transition: all 0.3s ease;
}

.lang-toggle:hover {
    border-color: var(--neon-green);
    background: var(--zentra-glow-soft);
    transform: translateY(-1px);
}
```

---

## 🎭 **7. الرسوم المتحركة والتأثيرات**

### الرسوم المتحركة الأساسية:
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
```

### تأثير Shimmer للأزرار:
```css
.btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.6s ease;
}

.btn-primary:hover::before {
    left: 100%;
}
```

### تأثير التوهج النابض:
```css
@keyframes glowPulse {
    0%, 100% {
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    }
    50% {
        box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
    }
}

.generate-btn:not(:disabled) {
    animation: glowPulse 3s ease-in-out infinite;
}
```

---

## 🔧 **8. تطبيق الهوية البصرية**

### الملفات المطلوبة:
1. `styles/main.css` - الأساسيات والمتغيرات
2. `styles/zentra-theme.css` - الهوية البصرية الجديدة
3. `styles/home-zentra.css` - تصميم الصفحة الرئيسية

### ترتيب تحميل CSS:
```html
<link rel="stylesheet" href="styles/main.css">
<link rel="stylesheet" href="styles/zentra-theme.css">
<link rel="stylesheet" href="styles/home-zentra.css">
```

### الخطوط المطلوبة:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;600;700&family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet">
```

---

## 🎯 **9. أمثلة التطبيق**

### Hero Section:
```css
.hero {
    background: linear-gradient(135deg, var(--black) 0%, var(--deep-green) 40%, var(--neon-green) 100%);
    padding: 140px 0 100px;
}

.hero-title {
    font-size: 4rem;
    font-weight: 700;
    background: linear-gradient(135deg, #ffffff 0%, var(--neon-green) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

### Feature Cards:
```css
.feature-card {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.feature-card:hover {
    transform: translateY(-8px);
    border-color: rgba(0, 255, 136, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}
```

### Form Elements:
```css
.form-input:focus {
    border-color: var(--neon-green);
    box-shadow: 0 0 0 4px var(--zentra-glow-soft);
    transform: translateY(-2px);
}
```

---

## ✨ **10. نصائح التطبيق**

### الأولويات:
1. **الوضوح** قبل الجمال
2. **سهولة الاستخدام** قبل التعقيد
3. **الاتساق** في جميع العناصر
4. **الأداء** مع التأثيرات

### أفضل الممارسات:
- استخدم `transform` بدلاً من تغيير `position` للرسوم المتحركة
- طبق `will-change` للعناصر المتحركة
- استخدم `cubic-bezier` للانتقالات الطبيعية
- اختبر على الأجهزة المختلفة

### إمكانية الوصول:
```css
@media (prefers-reduced-motion: reduce) {
    .generate-btn {
        animation: none;
    }
    
    .feature-card:hover {
        transform: none;
    }
}
```

---

## 🎉 **النتيجة النهائية**

تطبيق هذا الدليل سيحقق:
- ✅ **هوية بصرية قوية ومميزة**
- ✅ **تجربة مستخدم سلسة وحديثة**
- ✅ **دعم كامل لل��ة العربية**
- ✅ **تصميم متجاوب على جميع الأجهزة**
- ✅ **تأثيرات بصرية جذابة ومهنية**

**Zentra** الآن يتمتع بهوية بصرية حديثة وراقية تعكس قوة المنصة وسهولة استخدامها! 🚀✨