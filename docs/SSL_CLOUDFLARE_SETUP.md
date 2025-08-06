# SSL & Cloudflare Setup Guide for Zentra

## 🔒 Cloudflare Setup

### 1. Add Domain to Cloudflare
1. Sign up at [Cloudflare](https://www.cloudflare.com/)
2. Click "Add a Site"
3. Enter: `zentrahub.pro`
4. Select the **Free** plan
5. Cloudflare will scan existing DNS records

### 2. Update Nameservers
1. Go to your domain registrar
2. Change nameservers to Cloudflare's:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
3. Wait for propagation (5 minutes to 24 hours)

### 3. Configure DNS Records
Add these DNS records in Cloudflare:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | Your-Server-IP | Proxied (Orange) |
| A | www | Your-Server-IP | Proxied (Orange) |
| CNAME | app | zentrahub.pro | Proxied (Orange) |
| MX | @ | mail.zentrahub.pro | DNS only (Gray) |
| TXT | @ | v=spf1 include:sendgrid.net ~all | DNS only |
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:dmarc@zentrahub.pro | DNS only |

### 4. SSL/TLS Configuration
1. Go to **SSL/TLS** in Cloudflare
2. Set encryption mode to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

### 5. Origin Certificate
1. Go to **SSL/TLS > Origin Server**
2. Click "Create Certificate"
3. Private key type: **RSA (2048)**
4. Hostnames: `zentrahub.pro, *.zentrahub.pro`
5. Certificate Validity: **15 years**
6. Click "Create"
7. Save the certificate and private key

## 🔐 Server SSL Setup

### Option 1: Cloudflare Origin Certificate
```bash
# Save certificates on your server
sudo mkdir -p /etc/ssl/cloudflare
sudo nano /etc/ssl/cloudflare/cert.pem  # Paste certificate
sudo nano /etc/ssl/cloudflare/key.pem   # Paste private key
sudo chmod 600 /etc/ssl/cloudflare/key.pem
```

### Option 2: Let's Encrypt (Alternative)
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d zentrahub.pro -d www.zentrahub.pro

# Auto-renewal
sudo certbot renew --dry-run
```

## 🚀 Nginx Configuration

### 1. Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 2. Configure Nginx
Create `/etc/nginx/sites-available/zentrahub.pro`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name zentrahub.pro www.zentrahub.pro;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name zentrahub.pro www.zentrahub.pro;

    # SSL Configuration
    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location /static {
        alias /var/www/zentrahub.pro/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # File upload limit
    client_max_body_size 10M;
}
```

### 3. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/zentrahub.pro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🛡️ Cloudflare Security Settings

### 1. Firewall Rules
1. Go to **Security > WAF**
2. Create custom rules:
   - Block countries (if needed)
   - Rate limiting rules
   - Block suspicious user agents

### 2. DDoS Protection
1. Go to **Security > DDoS**
2. Set sensitivity to **High**
3. Enable **I'm Under Attack Mode** if needed

### 3. Bot Management
1. Go to **Security > Bots**
2. Configure bot fight mode
3. Add verified bots to allowlist

### 4. Page Rules
1. Go to **Rules > Page Rules**
2. Add rules:
   ```
   *zentrahub.pro/api/*
   - Cache Level: Bypass
   - Security Level: High
   
   *zentrahub.pro/static/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   ```

## 📊 Performance Optimization

### 1. Cloudflare Settings
- Enable **Auto Minify** (JS, CSS, HTML)
- Enable **Brotli** compression
- Enable **HTTP/2**
- Enable **HTTP/3 (with QUIC)**
- Enable **0-RTT Connection Resumption**

### 2. Caching Strategy
```javascript
// In your Express app
app.use((req, res, next) => {
  // API responses - no cache
  if (req.path.startsWith('/api')) {
    res.set('Cache-Control', 'no-store');
  }
  // Static assets - long cache
  else if (req.path.match(/\.(js|css|jpg|png|gif|ico|woff|woff2)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000');
  }
  next();
});
```

## 🔍 Monitoring & Analytics

### 1. Cloudflare Analytics
- Monitor traffic patterns
- Check cache hit ratio
- Review security events
- Track performance metrics

### 2. Real User Monitoring
```html
<!-- Add to your HTML -->
<script>
  // Cloudflare Web Analytics
  (function(){
    var script = document.createElement('script');
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', '{"token": "your-token"}');
    document.head.appendChild(script);
  })();
</script>
```

## 🚨 Troubleshooting

### SSL Certificate Errors
```
Error: ERR_SSL_VERSION_OR_CIPHER_MISMATCH
```
**Solution**: 
- Check SSL mode in Cloudflare (should be Full or Full Strict)
- Verify origin certificate is valid
- Check server SSL configuration

### 521 Error (Web Server Is Down)
**Solution**:
- Verify server is running
- Check if Cloudflare IPs are whitelisted
- Review server firewall rules

### 522 Error (Connection Timed Out)
**Solution**:
- Increase server timeout settings
- Check server resources (CPU, Memory)
- Verify Cloudflare IPs are allowed

## 📝 Pre-Launch Checklist

### DNS & SSL
- [ ] Domain nameservers pointed to Cloudflare
- [ ] All DNS records configured correctly
- [ ] SSL certificate installed and valid
- [ ] HTTPS redirect working
- [ ] Security headers configured

### Performance
- [ ] Caching rules configured
- [ ] Static assets optimized
- [ ] Compression enabled
- [ ] CDN properly configured

### Security
- [ ] Firewall rules configured
- [ ] DDoS protection enabled
- [ ] Bot protection configured
- [ ] Rate limiting enabled
- [ ] Security headers tested

### Monitoring
- [ ] Cloudflare analytics enabled
- [ ] Server monitoring configured
- [ ] Error tracking enabled
- [ ] Uptime monitoring active

## 🔧 Useful Commands

### Test SSL Configuration
```bash
# Check SSL certificate
openssl s_client -connect zentrahub.pro:443 -servername zentrahub.pro

# Test SSL Labs
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=zentrahub.pro
```

### Test Security Headers
```bash
curl -I https://zentrahub.pro
```

### Monitor Nginx
```bash
# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 📞 Support Resources

- [Cloudflare Documentation](https://developers.cloudflare.com/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [SSL Labs](https://www.ssllabs.com/)
- [Security Headers](https://securityheaders.com/)
- Cloudflare Support: support@cloudflare.com
- Zentra Support: info@zentrahub.pro