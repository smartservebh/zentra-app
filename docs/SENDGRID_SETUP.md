# SendGrid Email Setup Guide for Zentra

## 🚀 Quick Setup

### 1. Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com/)
2. Click "Start for Free"
3. Fill in your information
4. Verify your email address

### 2. Sender Authentication
1. Go to **Settings > Sender Authentication**
2. Choose authentication method:
   - **Domain Authentication** (Recommended for production)
   - **Single Sender Verification** (Quick start)

#### Domain Authentication (Production)
1. Click "Authenticate Your Domain"
2. DNS Host: Select your provider (Cloudflare, etc.)
3. Domain: `zentrahub.pro`
4. Add the DNS records provided to your domain
5. Verify the records

#### Single Sender Verification (Development)
1. Click "Verify a Single Sender"
2. From Email: `noreply@zentrahub.pro`
3. Reply To: `info@zentrahub.pro`
4. Verify the email address

### 3. Create API Key
1. Go to **Settings > API Keys**
2. Click "Create API Key"
3. API Key Name: `zentra-production`
4. API Key Permissions: **Full Access**
5. Click "Create & View"
6. **Copy the API key immediately** (shown only once)

### 4. Update .env File
```env
# SendGrid Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@zentrahub.pro
EMAIL_REPLY_TO=support@zentrahub.pro
```

## 📧 Email Templates Setup

### 1. Create Dynamic Templates
1. Go to **Email API > Dynamic Templates**
2. Click "Create a Dynamic Template"
3. Create templates for:
   - Welcome Email
   - Email Verification
   - Password Reset
   - Plan Changed
   - App Generated

### 2. Template Variables
```javascript
// Welcome Email Variables
{
  "name": "User Name",
  "plan": "Starter",
  "dashboardUrl": "https://zentrahub.pro/dashboard",
  "features": ["Feature 1", "Feature 2"]
}
```

### 3. Multi-Language Support
```handlebars
{{#if isArabic}}
  <h1>مرحباً {{name}}!</h1>
{{else}}
  <h1>Welcome {{name}}!</h1>
{{/if}}
```

## 🔒 Security Configuration

### 1. IP Access Management
1. Go to **Settings > IP Access Management**
2. Add your server's IP addresses
3. Enable "Enforce IP Access Management"

### 2. API Key Permissions
- Create separate keys for different environments
- Use restricted permissions when possible
- Rotate keys regularly

### 3. Webhook Security
```javascript
// Verify webhook signatures
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
  return hash === signature;
}
```

## 📊 Email Analytics

### 1. Enable Event Webhook
1. Go to **Settings > Mail Settings > Event Webhook**
2. HTTP Post URL: `https://zentrahub.pro/api/webhooks/sendgrid`
3. Select events to track:
   - Delivered
   - Opened
   - Clicked
   - Bounced
   - Spam Reports

### 2. Track Email Metrics
```javascript
// Store email events
const EmailEvent = new Schema({
  messageId: String,
  event: String,
  email: String,
  timestamp: Date,
  metadata: Object
});
```

## 🎨 Email Design Best Practices

### 1. Responsive Design
```html
<style>
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .content { padding: 10px !important; }
  }
</style>
```

### 2. Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
  .email-body { 
    background-color: #1a1a1a !important;
    color: #ffffff !important;
  }
}
```

### 3. Accessibility
- Use semantic HTML
- Include alt text for images
- Maintain color contrast ratio of 4.5:1

## 🚨 Troubleshooting

### Authentication Failed
```
Error: 535 Authentication failed: Bad username / password
```
**Solution**: 
- Ensure SMTP_USER is set to "apikey" (literal string)
- Verify API key is correct

### Rate Limit Exceeded
```
Error: 429 Too Many Requests
```
**Solution**: 
- Check your plan limits
- Implement rate limiting in your app
- Use batch sending for bulk emails

### Email Not Delivered
1. Check **Activity Feed** in SendGrid dashboard
2. Review bounce and block lists
3. Verify sender authentication
4. Check spam score

## 📝 Testing Checklist

### Before Going Live
- [ ] Domain authentication completed
- [ ] SPF record added
- [ ] DKIM records verified
- [ ] Email templates tested in multiple clients
- [ ] Unsubscribe link included
- [ ] Privacy policy link included
- [ ] Reply-to address configured
- [ ] Webhook endpoint secured
- [ ] Error handling implemented
- [ ] Rate limiting configured

### Email Clients to Test
- Gmail (Web & Mobile)
- Outlook (Web & Desktop)
- Apple Mail
- Yahoo Mail
- Mobile clients (iOS & Android)

## 🔧 Useful Scripts

### Test Email Delivery
```bash
node scripts/testEmail.js your-email@example.com
```

### Monitor Email Stats
```javascript
// Get email statistics
async function getEmailStats() {
  const sg = require('@sendgrid/client');
  sg.setApiKey(process.env.SENDGRID_API_KEY);
  
  const [response] = await sg.request({
    method: 'GET',
    url: '/v3/stats',
    qs: {
      start_date: '2024-01-01',
      end_date: '2024-12-31'
    }
  });
  
  return response.body;
}
```

## 📞 Support Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Email Testing Tool](https://www.mail-tester.com/)
- [Can I email?](https://www.caniemail.com/)
- SendGrid Support: support@sendgrid.com
- Zentra Support: support@zentrahub.pro