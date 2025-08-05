const sgMail = require('@sendgrid/mail');
const path = require('path');
const fs = require('fs').promises;
const handlebars = require('handlebars');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * SendGrid Email Service for Zentra
 * Handles all email communications using SendGrid API
 */
class SendGridService {
  constructor() {
    this.from = process.env.EMAIL_FROM || 'noreply@zentrahub.pro';
    this.replyTo = process.env.EMAIL_REPLY_TO || 'support@zentrahub.pro';
    this.templatesDir = path.join(__dirname, '..', 'email-templates');
  }

  /**
   * Send email using SendGrid
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} message - Plain text or HTML message
   * @param {Object} options - Additional options (html, attachments, etc.)
   * @returns {Promise<Object>} - SendGrid response or error
   */
  async sendEmail(to, subject, message, options = {}) {
    try {
      const msg = {
        to,
        from: {
          email: this.from,
          name: 'Zentra'
        },
        replyTo: this.replyTo,
        subject,
        text: message,
        html: options.html || message,
        ...options
      };

      // Send email
      const response = await sgMail.send(msg);
      
      console.log(`Email sent successfully to ${to}`);
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        statusCode: response[0].statusCode
      };
    } catch (error) {
      console.error('SendGrid error:', error);
      
      // Extract error details
      const errorDetails = {
        success: false,
        error: error.message,
        code: error.code,
        statusCode: error.response?.statusCode,
        body: error.response?.body
      };
      
      // Log detailed error for debugging
      if (error.response) {
        console.error('SendGrid response error:', error.response.body);
      }
      
      return errorDetails;
    }
  }

  /**
   * Send email using template
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} templateName - Template file name (without .html)
   * @param {Object} data - Template data
   * @returns {Promise<Object>} - SendGrid response or error
   */
  async sendTemplateEmail(to, subject, templateName, data = {}) {
    try {
      // Load template
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      
      // Compile template
      const template = handlebars.compile(templateContent);
      const html = template(data);
      
      // Extract plain text from HTML (basic implementation)
      const text = html.replace(/<[^>]*>/g, '').trim();
      
      return await this.sendEmail(to, subject, text, { html });
    } catch (error) {
      console.error(`Template error for ${templateName}:`, error);
      return {
        success: false,
        error: `Failed to load template: ${error.message}`
      };
    }
  }

  /**
   * Send welcome email
   * @param {Object} user - User object with email, username, plan
   * @returns {Promise<Object>} - SendGrid response
   */
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Zentra! 🚀';
    const data = {
      username: user.username,
      email: user.email,
      plan: user.plan || 'free',
      dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      year: new Date().getFullYear()
    };
    
    return await this.sendTemplateEmail(user.email, subject, 'welcome', data);
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>} - SendGrid response
   */
  async sendPasswordResetEmail(user, resetToken) {
    const subject = 'Reset Your Zentra Password';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const data = {
      username: user.username,
      resetUrl,
      expiryTime: '1 hour',
      year: new Date().getFullYear()
    };
    
    return await this.sendTemplateEmail(user.email, subject, 'password-reset', data);
  }

  /**
   * Send email verification
   * @param {Object} user - User object
   * @param {string} verificationCode - 6-digit verification code
   * @returns {Promise<Object>} - SendGrid response
   */
  async sendVerificationEmail(user, verificationCode) {
    const subject = 'Verify Your Zentra Account';
    const data = {
      username: user.username,
      verificationCode,
      year: new Date().getFullYear()
    };
    
    return await this.sendTemplateEmail(user.email, subject, 'email-verification', data);
  }

  /**
   * Send app generated notification
   * @param {Object} user - User object
   * @param {Object} app - App details
   * @returns {Promise<Object>} - SendGrid response
   */
  async sendAppGeneratedEmail(user, app) {
    const subject = `Your app "${app.title}" is ready! 🎉`;
    const data = {
      username: user.username,
      appTitle: app.title,
      appDescription: app.description,
      appUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/app/${app.appId}`,
      editorUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/editor?id=${app.appId}`,
      generationTime: `${(app.generationTime / 1000).toFixed(1)} seconds`,
      year: new Date().getFullYear()
    };
    
    return await this.sendTemplateEmail(user.email, subject, 'app-generated', data);
  }

  /**
   * Send plan changed email
   * @param {Object} user - User object
   * @param {string} oldPlan - Previous plan
   * @param {string} newPlan - New plan
   * @param {Object} details - Additional details
   * @returns {Promise<Object>} - SendGrid response
   */
  async sendPlanChangedEmail(user, oldPlan, newPlan, details = {}) {
    const subject = `Your Zentra plan has been ${newPlan > oldPlan ? 'upgraded' : 'changed'}`;
    const data = {
      username: user.username,
      oldPlan,
      newPlan,
      isUpgrade: newPlan > oldPlan,
      dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      subscriptionUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription`,
      ...details,
      year: new Date().getFullYear()
    };
    
    return await this.sendTemplateEmail(user.email, subject, 'plan-changed', data);
  }

  /**
   * Send bulk emails (with rate limiting)
   * @param {Array} recipients - Array of {email, data} objects
   * @param {string} subject - Email subject
   * @param {string} templateName - Template name
   * @returns {Promise<Object>} - Results summary
   */
  async sendBulkEmails(recipients, subject, templateName) {
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };
    
    // SendGrid allows up to 1000 recipients per request
    const batchSize = 100;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      // Process batch with slight delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          const result = await this.sendTemplateEmail(
            recipient.email,
            subject,
            templateName,
            recipient.data
          );
          
          if (result.success) {
            results.sent++;
          } else {
            results.failed++;
            results.errors.push({
              email: recipient.email,
              error: result.error
            });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            email: recipient.email,
            error: error.message
          });
        }
      });
      
      await Promise.all(batchPromises);
    }
    
    return results;
  }

  /**
   * Test email configuration
   * @returns {Promise<boolean>} - True if configuration is valid
   */
  async testConnection() {
    try {
      // SendGrid doesn't have a specific test endpoint
      // We'll validate the API key format
      const apiKey = process.env.SENDGRID_API_KEY;
      
      if (!apiKey || !apiKey.startsWith('SG.')) {
        console.error('Invalid SendGrid API key format');
        return false;
      }
      
      // Try to send a test email to verify the key works
      // This is commented out to avoid sending unnecessary emails
      /*
      const testResult = await this.sendEmail(
        'test@example.com',
        'SendGrid Test',
        'This is a test email',
        { sandbox_mode: { enable: true } } // Sandbox mode prevents actual sending
      );
      */
      
      return true;
    } catch (error) {
      console.error('SendGrid connection test failed:', error);
      return false;
    }
  }

  /**
   * Get email statistics (requires additional SendGrid permissions)
   * @param {Date} startDate - Start date for stats
   * @param {Date} endDate - End date for stats
   * @returns {Promise<Object>} - Email statistics
   */
  async getEmailStats(startDate, endDate) {
    // This would require additional SendGrid API setup
    // Placeholder for future implementation
    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      spam_reports: 0
    };
  }
}

// Create singleton instance
const sendGridService = new SendGridService();

// Export both the class and instance
module.exports = sendGridService;
module.exports.SendGridService = SendGridService;