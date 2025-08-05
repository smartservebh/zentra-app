# Email Setup Guide for Zentra

## 🚀 Quick Setup with SendGrid

Zentra is configured to use SendGrid for email delivery.

### Configuration
```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=noreply@zentrahub.pro
EMAIL_REPLY_TO=support@zentrahub.pro
```

## 📧 Using the Email Service

### 1. Simple Email Function
```javascript
const sendEmail = require('./utils/sendEmail');

// Send a simple email
await sendEmail(
  'user@example.com',
  'Welcome to Zentra!',
  'Thank you for joining us!'
);
```

### 2. HTML Email
```javascript
await sendEmail(
  'user@example.com',
  'Your App is Ready!',
  '<h1>Congratulations!</h1><p>Your app has been generated.</p>'
);
```

### 3. Using Email Service
```javascript
const emailService = require('./services/emailService');

// Send welcome email
await emailService.sendWelcomeEmail({
  email: 'user@example.com',
  username: 'John Doe',
  plan: 'starter'
});
```

## 🧪 Testing Email Configuration

Run the test script to verify everything is working:

```bash
node scripts/testEmail.js your-email@example.com
```

## 📨 Email Templates

Email templates are located in `/email-templates/`:
- `welcome.html` - Welcome email for new users
- `verify-email.html` - Email verification
- `reset-password.html` - Password reset
- `app-generated.html` - App generation notification
- `plan-changed.html` - Subscription changes

## 🔒 Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Validate email addresses** before sending
3. **Implement rate limiting** for user-triggered emails
4. **Use templates** to prevent injection attacks
5. **Monitor for abuse** - Set up alerts in SendGrid

## 📞 Support

- SendGrid Support: https://support.sendgrid.com
- API Documentation: https://docs.sendgrid.com
- Zentra Support: support@zentrahub.pro