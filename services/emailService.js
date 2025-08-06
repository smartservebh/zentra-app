const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  constructor() {
    this.useSendGrid = !!process.env.SENDGRID_API_KEY;
    this.transporter = null;
    this.templates = {};
    
    if (!this.useSendGrid) {
      // Fallback to SMTP if SendGrid is not configured
      this.initializeSMTP();
    }
    
    this.loadTemplates();
  }

  initializeSMTP() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PASS) {
      console.warn('Neither SendGrid nor SMTP is configured. Email service disabled.');
      return;
    }

    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '..', 'email-templates');
      
      // Create templates directory if it doesn't exist
      await fs.mkdir(templatesDir, { recursive: true });
      
      // Load or create default templates
      const templates = ['welcome', 'reset-password', 'verify-email', 'app-generated', 'plan-changed'];
      
      for (const template of templates) {
        try {
          const html = await fs.readFile(path.join(templatesDir, `${template}.html`), 'utf8');
          this.templates[template] = handlebars.compile(html);
        } catch (error) {
          // Create default template if not exists
          this.templates[template] = handlebars.compile(this.getDefaultTemplate(template));
        }
      }
    } catch (error) {
      console.error('Failed to load email templates:', error);
    }
  }

  getDefaultTemplate(templateName) {
    const templates = {
      'welcome': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Zentra</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Zentra!</h1>
    </div>
    <div class="content">
      <h2>Hi {{name}},</h2>
      <p>Welcome to Zentra! We're excited to have you on board.</p>
      <p>With Zentra, you can turn your ideas into fully functional web applications in seconds using AI.</p>
      <p>Your account is now active with the {{plan}} plan.</p>
      <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
      <p>If you have any questions, feel free to reach out to us at support@zentrahub.pro</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Zentra. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
      'verify-email': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .code { background: #e9ecef; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <h2>Hi {{name}},</h2>
      <p>Please verify your email address to complete your registration.</p>
      <div class="code">{{verificationCode}}</div>
      <p>Or click the button below:</p>
      <a href="{{verificationUrl}}" class="button">Verify Email</a>
      <p>This code will expire in 24 hours.</p>
    </div>
  </div>
</body>
</html>`,
      'reset-password': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <h2>Hi {{name}},</h2>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="{{resetUrl}}" class="button">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  </div>
</body>
</html>`,
      'app-generated': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your App is Ready!</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .app-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your App is Ready! 🎉</h1>
    </div>
    <div class="content">
      <h2>Hi {{name}},</h2>
      <p>Great news! Your app "{{appTitle}}" has been generated successfully.</p>
      <div class="app-info">
        <h3>{{appTitle}}</h3>
        <p>{{appDescription}}</p>
        <p><strong>Category:</strong> {{appCategory}}</p>
        <p><strong>Generated in:</strong> {{generationTime}}s</p>
      </div>
      <a href="{{appUrl}}" class="button">View Your App</a>
      <p>You can edit, publish, or share your app from your dashboard.</p>
    </div>
  </div>
</body>
</html>`
    };
    
    return templates[templateName] || templates['welcome'];
  }

  /**
   * Main email sending function
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} message - Plain text message or template name
   * @param {Object} data - Template data or additional options
   */
  async sendEmail(to, subject, message, data = {}) {
    try {
      // Check if message is a template name
      const isTemplate = this.templates[message];
      const html = isTemplate ? this.templates[message](data) : message;
      const text = html.replace(/<[^>]*>/g, '').trim(); // Basic HTML to text conversion

      if (this.useSendGrid) {
        // Use SendGrid API
        const msg = {
          to,
          from: {
            email: process.env.EMAIL_FROM || 'noreply@zentrahub.pro',
            name: 'Zentra'
          },
          replyTo: process.env.EMAIL_REPLY_TO || 'info@zentrahub.pro',
          subject,
          text,
          html
        };

        const response = await sgMail.send(msg);
        console.log('Email sent via SendGrid:', response[0].statusCode);
        
        return { 
          success: true, 
          messageId: response[0].headers['x-message-id'],
          method: 'sendgrid'
        };
      } else if (this.transporter) {
        // Use SMTP
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'noreply@zentrahub.pro',
          to,
          subject,
          text,
          html
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log('Email sent via SMTP:', info.messageId);
        
        return { 
          success: true, 
          messageId: info.messageId,
          method: 'smtp'
        };
      } else {
        throw new Error('Email service not configured');
      }
    } catch (error) {
      console.error('Email send error:', error);
      
      // Extract SendGrid specific error details
      if (error.response) {
        console.error('SendGrid error details:', error.response.body);
      }
      
      return { 
        success: false, 
        error: error.message,
        details: error.response?.body
      };
    }
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail(
      user.email,
      'Welcome to Zentra! 🚀',
      'welcome',
      {
        name: user.username,
        plan: user.plan,
        dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
      }
    );
  }

  async sendVerificationEmail(user, verificationCode) {
    return this.sendEmail(
      user.email,
      'Verify Your Email - Zentra',
      'verify-email',
      {
        name: user.username,
        verificationCode,
        verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?code=${verificationCode}`
      }
    );
  }

  async sendPasswordResetEmail(user, resetToken) {
    return this.sendEmail(
      user.email,
      'Reset Your Password - Zentra',
      'reset-password',
      {
        name: user.username,
        resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      }
    );
  }

  async sendAppGeneratedEmail(user, app) {
    return this.sendEmail(
      user.email,
      `Your app "${app.title}" is ready! 🎉`,
      'app-generated',
      {
        name: user.username,
        appTitle: app.title,
        appDescription: app.description,
        appCategory: app.category,
        generationTime: (app.generationTime / 1000).toFixed(2),
        appUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/app/${app.appId}`
      }
    );
  }

  async sendPlanChangedEmail(user, oldPlan, newPlan, planDetails) {
    const planCredits = {
      free: { messages: 25, integrations: 500 },
      starter: { messages: 100, integrations: 2000 },
      builder: { messages: 250, integrations: 10000 },
      pro: { messages: 500, integrations: 20000 }
    };

    const planPrices = {
      free: 0,
      starter: 19,
      builder: 49,
      pro: 99
    };

    const planFeatures = {
      starter: ['Custom domains', 'GitHub integration'],
      builder: ['Analytics dashboard', 'Authentication system', 'Database functionality'],
      pro: ['Early access to beta features', 'Priority support']
    };

    const isUpgrade = ['free', 'starter', 'builder', 'pro'].indexOf(newPlan) > 
                      ['free', 'starter', 'builder', 'pro'].indexOf(oldPlan);

    let newFeatures = [];
    if (isUpgrade) {
      const oldIndex = ['free', 'starter', 'builder', 'pro'].indexOf(oldPlan);
      const newIndex = ['free', 'starter', 'builder', 'pro'].indexOf(newPlan);
      
      for (let i = oldIndex + 1; i <= newIndex; i++) {
        const plan = ['free', 'starter', 'builder', 'pro'][i];
        if (planFeatures[plan]) {
          newFeatures = newFeatures.concat(planFeatures[plan]);
        }
      }
    }

    return this.sendEmail(
      user.email,
      isUpgrade ? '🎊 Your Zentra Plan Has Been Upgraded!' : 'Your Zentra Plan Has Been Updated',
      'plan-changed',
      {
        name: user.username,
        isUpgrade,
        oldPlan: oldPlan.charAt(0).toUpperCase() + oldPlan.slice(1),
        newPlan: newPlan.charAt(0).toUpperCase() + newPlan.slice(1),
        oldCredits: planCredits[oldPlan],
        newCredits: planCredits[newPlan],
        newFeatures: newFeatures.length > 0 ? newFeatures : null,
        price: planPrices[newPlan],
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        proratedAmount: planDetails?.proratedAmount || 0,
        dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
        manageSubscriptionUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/subscription`,
        privacyUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy`,
        termsUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms`
      }
    );
  }

  // Test email configuration
  async testConnection() {
    try {
      if (this.useSendGrid) {
        // SendGrid doesn't have a verify method, but we can check the API key
        if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
          throw new Error('Invalid SendGrid API key');
        }
        console.log('SendGrid email service is configured');
        return true;
      } else if (this.transporter) {
        await this.transporter.verify();
        console.log('SMTP email service is ready');
        return true;
      } else {
        throw new Error('No email service configured');
      }
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();