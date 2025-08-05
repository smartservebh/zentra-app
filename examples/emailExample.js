/**
 * Email Usage Examples for Zentra
 * ================================
 * This file demonstrates how to use the sendEmail function
 */

require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

// Example 1: Simple text email
async function sendWelcomeEmail() {
  const result = await sendEmail(
    'user@example.com',
    'Welcome to Zentra!',
    'Thank you for joining Zentra. We are excited to have you on board!'
  );
  
  console.log('Welcome email result:', result);
}

// Example 2: HTML email
async function sendHTMLEmail() {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your App is Ready!</h1>
        </div>
        <div class="content">
          <p>Congratulations! Your app has been generated successfully.</p>
          <p>Click the button below to view your app:</p>
          <a href="https://zentrahub.pro/app/123" class="button">View App</a>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const result = await sendEmail(
    'user@example.com',
    'Your Zentra App is Ready! 🎉',
    htmlContent
  );
  
  console.log('HTML email result:', result);
}

// Example 3: Email with attachments
async function sendEmailWithAttachment() {
  const result = await sendEmail(
    'user@example.com',
    'Your Invoice',
    '<h1>Invoice</h1><p>Please find your invoice attached.</p>',
    {
      attachments: [{
        content: Buffer.from('Invoice content here').toString('base64'),
        filename: 'invoice.txt',
        type: 'text/plain',
        disposition: 'attachment'
      }]
    }
  );
  
  console.log('Email with attachment result:', result);
}

// Example 4: Email with CC and BCC
async function sendEmailWithCCBCC() {
  const result = await sendEmail(
    'user@example.com',
    'Team Update',
    'This is an important update for the team.',
    {
      cc: ['manager@example.com'],
      bcc: ['admin@example.com']
    }
  );
  
  console.log('Email with CC/BCC result:', result);
}

// Example 5: Bulk email sending
async function sendBulkEmails() {
  const recipients = [
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
  ];
  
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail(
      recipient,
      'Newsletter: Zentra Updates',
      `
        <h2>Zentra Monthly Newsletter</h2>
        <p>Here are the latest updates from Zentra...</p>
        <ul>
          <li>New AI models added</li>
          <li>Performance improvements</li>
          <li>Bug fixes</li>
        </ul>
      `
    );
    
    results.push(result);
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Bulk email results:', results);
}

// Example 6: Error handling
async function sendEmailWithErrorHandling() {
  try {
    const result = await sendEmail(
      'invalid-email',
      'Test Subject',
      'Test message'
    );
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.error('❌ Failed to send email:', result.error);
      if (result.details) {
        console.error('Error details:', result.details);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run examples (uncomment to test)
async function runExamples() {
  console.log('🚀 Running email examples...\n');
  
  // await sendWelcomeEmail();
  // await sendHTMLEmail();
  // await sendEmailWithAttachment();
  // await sendEmailWithCCBCC();
  // await sendBulkEmails();
  // await sendEmailWithErrorHandling();
  
  console.log('\n✅ Examples completed!');
}

// Export examples for testing
module.exports = {
  sendWelcomeEmail,
  sendHTMLEmail,
  sendEmailWithAttachment,
  sendEmailWithCCBCC,
  sendBulkEmails,
  sendEmailWithErrorHandling
};

// Run if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}