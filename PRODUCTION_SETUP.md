# 🚀 Zentra Production Setup Guide

This guide will help you deploy Zentra to production with all services properly configured.

## 📋 Prerequisites

- Ubuntu 20.04+ server with root access
- Domain name (zentrahub.pro) pointed to your server
- Node.js 18+ installed
- MongoDB Atlas account
- SendGrid account
- Cloudflare account

## 🔧 Quick Setup Steps

### 1. Clone and Install
```bash
# Clone repository
git clone https://github.com/yourusername/zentra-app.git
cd zentra-app

# Install dependencies
npm install

# Copy production environment file
cp .env.production .env
```

### 2. Configure Environment Variables
Edit `.env` file with your actual values:

```env
# Critical configurations
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb+srv://...
JWT_SECRET=generate-32-char-secret-here
SMTP_PASS=your-sendgrid-api-key
```

### 3. Setup Services

#### MongoDB Atlas
```bash
# Test connection
node scripts/testMongoDB.js

# Run database setup
npm run setup
```
📖 [Detailed MongoDB Setup Guide](docs/MONGODB_ATLAS_SETUP.md)

#### SendGrid Email
```bash
# Test email configuration
node scripts/testEmail.js your-email@example.com
```
📖 [Detailed SendGrid Setup Guide](docs/SENDGRID_SETUP.md)

#### SSL & Cloudflare
```bash
# Setup Nginx
sudo apt install nginx
sudo cp nginx.conf /etc/nginx/sites-available/zentrahub.pro
sudo ln -s /etc/nginx/sites-available/zentrahub.pro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
📖 [Detailed SSL & Cloudflare Setup Guide](docs/SSL_CLOUDFLARE_SETUP.md)

### 4. Deploy Application

#### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Systemd
```bash
# Create service file
sudo nano /etc/systemd/system/zentra.service

# Add configuration
[Unit]
Description=Zentra App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/zentra-app
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable zentra
sudo systemctl start zentra
```

## ✅ Production Checklist

### Environment Setup
- [ ] `.env` file configured with production values
- [ ] `NODE_ENV=production` set
- [ ] All API keys and secrets configured
- [ ] Backup `.env` file stored securely

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user with strong password
- [ ] IP whitelist configured (server IP only)
- [ ] Connection string tested
- [ ] Indexes created for performance
- [ ] Backup strategy implemented

### Email Service
- [ ] SendGrid account verified
- [ ] Domain authentication completed
- [ ] API key created and configured
- [ ] Email templates tested
- [ ] SPF, DKIM, DMARC records added
- [ ] Unsubscribe mechanism implemented

### SSL & Security
- [ ] SSL certificate installed
- [ ] HTTPS redirect configured
- [ ] Security headers implemented
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

### Performance
- [ ] Static assets cached
- [ ] Gzip/Brotli compression enabled
- [ ] Database queries optimized
- [ ] CDN configured via Cloudflare
- [ ] Image optimization implemented

### Monitoring
- [ ] Error tracking (Sentry) configured
- [ ] Uptime monitoring active
- [ ] Log rotation configured
- [ ] Health check endpoint working
- [ ] Analytics tracking enabled

### Backup & Recovery
- [ ] Database backups scheduled
- [ ] Application code in Git
- [ ] Environment variables backed up
- [ ] Disaster recovery plan documented

## 🚨 Common Issues & Solutions

### Port 3000 Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### MongoDB Connection Failed
1. Check IP whitelist in Atlas
2. Verify connection string format
3. Test with MongoDB Compass
4. Check network connectivity

### Email Not Sending
1. Verify SendGrid API key
2. Check sender authentication
3. Review email activity in SendGrid
4. Test with `node scripts/testEmail.js`

### SSL Certificate Issues
1. Check Cloudflare SSL mode (Full or Full Strict)
2. Verify origin certificate installation
3. Test with SSL Labs
4. Check Nginx configuration

## 📊 Monitoring Commands

```bash
# Check application status
pm2 status
pm2 logs zentra

# Monitor server resources
htop
df -h
free -m

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Test endpoints
curl https://zentrahub.pro/api/health
```

## 🔐 Security Hardening

### Server Security
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Install fail2ban
sudo apt install fail2ban
```

### Application Security
```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Security headers
const helmet = require('helmet');
app.use(helmet());
```

## 📱 Post-Deployment Tasks

1. **Test All Features**
   - User registration with email
   - App generation
   - Plan upgrades
   - Payment processing

2. **Configure Backups**
   ```bash
   # Setup daily backups
   crontab -e
   0 2 * * * /home/ubuntu/zentra-app/scripts/backup.sh
   ```

3. **Monitor Performance**
   - Set up Google Analytics
   - Configure Cloudflare Analytics
   - Monitor server metrics

4. **Documentation**
   - Update API documentation
   - Create user guides
   - Document deployment process

## 🆘 Emergency Contacts

- **Server Issues**: Your hosting provider support
- **Domain/DNS**: Cloudflare support
- **Database**: MongoDB Atlas support
- **Email**: SendGrid support
- **Application**: support@zentrahub.pro

## 📝 Final Notes

1. **Keep Everything Updated**
   - Regularly update Node.js and npm packages
   - Apply security patches promptly
   - Monitor for vulnerabilities

2. **Regular Maintenance**
   - Check logs weekly
   - Review error reports
   - Optimize database queries
   - Clean up old data

3. **Scaling Considerations**
   - Monitor resource usage
   - Plan for horizontal scaling
   - Consider load balancing
   - Implement caching strategies

---

**Need Help?** Contact the development team or check the detailed guides in the `docs/` directory.

**Remember**: Always test changes in a staging environment before deploying to production!