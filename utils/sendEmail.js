const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email using SendGrid
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} message - Email message (HTML or plain text)
 * @param {Object} options - Additional options (optional)
 * @returns {Promise<Object>} - Result object with success status
 */
async function sendEmail(to, subject, message, options = {}) {
  try {
    // Prepare email message
    const msg = {
      to,
      from: {
        email: process.env.EMAIL_FROM || 'noreply@zentrahub.pro',
        name: 'Zentra'
      },
      subject,
      text: message.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html: message,
      ...options
    };

    // Add reply-to if specified
    if (process.env.EMAIL_REPLY_TO) {
      msg.replyTo = process.env.EMAIL_REPLY_TO;
    }

    // Send email
    const [response] = await sgMail.send(msg);

    // Log success
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Message ID: ${response.headers['x-message-id']}`);

    return {
      success: true,
      statusCode: response.statusCode,
      messageId: response.headers['x-message-id'],
      to,
      subject
    };

  } catch (error) {
    // Log error details
    console.error(`❌ Failed to send email to ${to}`);
    console.error(`   Subject: ${subject}`);
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status Code: ${error.response.statusCode}`);
      console.error(`   Error Details:`, error.response.body);
    }

    return {
      success: false,
      error: error.message,
      statusCode: error.response?.statusCode,
      details: error.response?.body,
      to,
      subject
    };
  }
}

// Export the function
module.exports = sendEmail;

// Example usage:
/*
const sendEmail = require('./utils/sendEmail');

// Simple text email
await sendEmail(
  'user@example.com',
  'Welcome to Zentra!',
  'Thank you for joining Zentra. We are excited to have you!'
);

// HTML email
await sendEmail(
  'user@example.com',
  'Your App is Ready!',
  '<h1>Congratulations!</h1><p>Your app has been generated successfully.</p>'
);

// With additional options
await sendEmail(
  'user@example.com',
  'Important Update',
  'Your subscription has been updated.',
  {
    cc: 'admin@zentrahub.pro',
    attachments: [{
      content: 'base64-encoded-content',
      filename: 'invoice.pdf',
      type: 'application/pdf'
    }]
  }
);
*/