const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AppGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // Detect language of the prompt
  detectLanguage(prompt) {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(prompt) ? 'ar' : 'en';
  }

  // Generate system prompt based on language
  getSystemPrompt(language) {
    const prompts = {
      en: `You are an expert web developer that creates complete, functional web applications based on user descriptions. 

IMPORTANT RULES:
1. Generate COMPLETE, WORKING HTML, CSS, and JavaScript code
2. Create a fully functional single-page application
3. Use modern, responsive design with mobile-first approach
4. Include proper error handling and user feedback
5. Use semantic HTML5 and accessible design
6. Implement smooth animations and transitions
7. Make it visually appealing with modern UI/UX
8. Include interactive features when relevant
9. Use vanilla JavaScript (no external libraries unless absolutely necessary)
10. Ensure the app works immediately without any setup

RESPONSE FORMAT:
Return a JSON object with exactly this structure:
{
  "title": "App Title",
  "description": "Brief description of the app",
  "category": "business|education|entertainment|productivity|social|utility|other",
  "html": "complete HTML code",
  "css": "complete CSS code", 
  "js": "complete JavaScript code"
}

The HTML should be a complete document with proper DOCTYPE, head, and body sections.
The CSS should include all styling for responsive design.
The JavaScript should include all functionality and interactivity.`,

      ar: `أنت مطور ويب خبير ينشئ تطبيقات ويب كاملة وعملية بناءً على أوصاف المستخدمين.

القواعد المهمة:
1. أنشئ كود HTML و CSS و JavaScript كامل وعملي
2. أنشئ تطبيق صفحة واحدة عملي بالكامل
3. استخدم تصميم حديث ومتجاوب مع نهج الهاتف المحمول أولاً
4. قم بتضمين معالجة الأخطاء المناسبة وتعليقات المستخدم
5. استخدم HTML5 الدلالي والتصميم القابل للوصول
6. قم بتنفيذ الرسوم المتحركة والانتق��لات السلسة
7. اجعله جذاباً بصرياً مع واجهة مستخدم/تجربة مستخدم حديثة
8. قم بتضمين الميزات التفاعلية عند الصلة
9. استخدم JavaScript الخام (لا مكتبات خارجية إلا إذا كان ضرورياً للغاية)
10. تأكد من أن التطبيق يعمل فوراً بدون أي إعداد

تنسيق الاستجابة:
أرجع كائن JSON بهذا الهيكل بالضبط:
{
  "title": "عنوان التطبيق",
  "description": "وصف مختصر للتطبيق",
  "category": "business|education|entertainment|productivity|social|utility|other",
  "html": "كود HTML كامل",
  "css": "كود CSS كامل",
  "js": "كود JavaScript كامل"
}

يجب أن يكون HTML مستنداً كاملاً مع DOCTYPE مناسب وأقسام head و body.
يجب أن يتضمن CSS جميع التصميمات للتصميم المتجاوب.
يجب أن يتضمن JavaScript جميع الوظائف والتفاعل.`
    };

    return prompts[language] || prompts.en;
  }

  // Generate user prompt based on language
  getUserPrompt(prompt, language) {
    const templates = {
      en: `Create a web application for: ${prompt}

Make it modern, responsive, and fully functional. Include all necessary features and make it visually appealing.`,
      ar: `أنشئ تطبيق ويب لـ: ${prompt}

اجعله حديثاً ومتجاوباً وعملياً بالكامل. قم بتضمين جميع الميزات الضرورية واجعله جذاباً بصرياً.`
    };

    return templates[language] || templates.en;
  }

  // Generate app using OpenAI
  async generateApp(prompt, userId) {
    try {
      const startTime = Date.now();
      const language = this.detectLanguage(prompt);
      
      console.log(`Generating app for prompt: "${prompt}" (Language: ${language})`);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(language)
          },
          {
            role: "user",
            content: this.getUserPrompt(prompt, language)
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      const response = completion.choices[0].message.content;
      console.log('OpenAI response received');

      // Parse the JSON response
      let appData;
      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        appData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        throw new Error('Failed to parse app generation response');
      }

      // Validate required fields
      if (!appData.html || !appData.css || !appData.js || !appData.title) {
        throw new Error('Incomplete app data received from AI');
      }

      // Generate unique app ID
      const appId = uuidv4();
      const generationTime = Date.now() - startTime;

      // Create app directory
      const appDir = path.join(__dirname, '..', 'generated-apps', appId);
      await fs.ensureDir(appDir);

      // Write app files
      await fs.writeFile(path.join(appDir, 'index.html'), appData.html);
      await fs.writeFile(path.join(appDir, 'style.css'), appData.css);
      await fs.writeFile(path.join(appDir, 'script.js'), appData.js);

      // Create a combined HTML file for easy viewing
      const combinedHtml = this.createCombinedHtml(appData.html, appData.css, appData.js);
      await fs.writeFile(path.join(appDir, 'app.html'), combinedHtml);

      console.log(`App generated successfully: ${appId}`);

      return {
        appId,
        title: appData.title,
        description: appData.description || 'Generated web application',
        category: appData.category || 'other',
        htmlContent: appData.html,
        cssContent: appData.css,
        jsContent: appData.js,
        promptLanguage: language,
        generationTime
      };

    } catch (error) {
      console.error('App generation error:', error);
      throw new Error(`Failed to generate app: ${error.message}`);
    }
  }

  // Create combined HTML file with embedded CSS and JS
  createCombinedHtml(html, css, js) {
    // Extract body content from HTML
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    
    const bodyContent = bodyMatch ? bodyMatch[1] : html;
    const headContent = headMatch ? headMatch[1] : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${headContent}
    <style>
        ${css}
    </style>
</head>
<body>
    ${bodyContent}
    <script>
        ${js}
    </script>
</body>
</html>`;
  }

  // Get app files
  async getAppFiles(appId) {
    try {
      const appDir = path.join(__dirname, '..', 'generated-apps', appId);
      
      const [html, css, js] = await Promise.all([
        fs.readFile(path.join(appDir, 'index.html'), 'utf8'),
        fs.readFile(path.join(appDir, 'style.css'), 'utf8'),
        fs.readFile(path.join(appDir, 'script.js'), 'utf8')
      ]);

      return { html, css, js };
    } catch (error) {
      throw new Error('App files not found');
    }
  }

  // Delete app files
  async deleteAppFiles(appId) {
    try {
      const appDir = path.join(__dirname, '..', 'generated-apps', appId);
      await fs.remove(appDir);
    } catch (error) {
      console.error('Failed to delete app files:', error);
    }
  }
}

module.exports = new AppGenerator();