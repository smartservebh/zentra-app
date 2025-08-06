# MongoDB Atlas Setup Guide for Zentra

## 🚀 Quick Setup

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Verify your email

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** Shared Cluster (M0)
3. Select Cloud Provider: **AWS**
4. Select Region: Choose closest to your users
5. Cluster Name: `zentra-cluster`
6. Click "Create Cluster"

### 3. Database Access
1. Go to **Database Access** in sidebar
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `zentra-admin`
5. Password: Generate a secure password
6. Database User Privileges: **Atlas Admin**
7. Click "Add User"

### 4. Network Access
1. Go to **Network Access** in sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your server's IP address
5. Click "Confirm"

### 5. Get Connection String
1. Go to **Database** in sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**
5. Version: **4.1 or later**
6. Copy the connection string

### 6. Update .env File
```env
MONGODB_URI=mongodb+srv://zentra-admin:<password>@zentra-cluster.xxxxx.mongodb.net/zentra?retryWrites=true&w=majority
```
Replace `<password>` with your actual password.

## 🔒 Security Best Practices

### 1. IP Whitelisting
- **Never use 0.0.0.0/0 in production**
- Add only your server's static IP
- Use VPC peering for AWS deployments

### 2. Database User Permissions
- Create separate users for different environments
- Use read-only users for analytics
- Rotate passwords regularly

### 3. Connection Security
```javascript
// Use connection pooling
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};
```

### 4. Enable Encryption
- Atlas encrypts data at rest by default
- Use TLS/SSL for connections (enabled by default)

## 📊 Monitoring Setup

### 1. Enable Performance Advisor
1. Go to cluster dashboard
2. Click "Performance Advisor"
3. Review suggested indexes

### 2. Set Up Alerts
1. Go to "Alerts" in project settings
2. Configure alerts for:
   - High CPU usage
   - High memory usage
   - Slow queries
   - Connection limits

### 3. Enable Profiler
```javascript
// In your app, log slow queries
mongoose.set('debug', process.env.NODE_ENV === 'development');
```

## 🔄 Backup Configuration

### 1. Automated Backups
- M10+ clusters have automated backups
- For M0 (free), implement manual backups:

```bash
# Backup script
mongodump --uri="your-connection-string" --out=./backups/$(date +%Y%m%d)
```

### 2. Point-in-Time Recovery
- Available for M10+ clusters
- Allows recovery to any point in last 24 hours

## 🚨 Common Issues & Solutions

### Connection Timeout
```
Error: MongooseServerSelectionError: connection timed out
```
**Solution**: Check IP whitelist and network access settings

### Authentication Failed
```
Error: MongoServerError: bad auth
```
**Solution**: Verify username/password and database name

### SSL Certificate Error
```
Error: certificate has expired
```
**Solution**: Update Node.js and MongoDB driver

## 📝 Environment-Specific Configurations

### Development
```env
MONGODB_URI=mongodb://localhost:27017/zentra-dev
```

### Staging
```env
MONGODB_URI=mongodb+srv://zentra-staging:password@cluster/zentra-staging
```

### Production
```env
MONGODB_URI=mongodb+srv://zentra-prod:password@cluster/zentra-prod
```

## 🔧 Useful Commands

### Test Connection
```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection failed:', err));
"
```

### Create Indexes
```javascript
// In your models
userSchema.index({ email: 1 }, { unique: true });
appSchema.index({ userId: 1, createdAt: -1 });
```

## 📞 Support Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/)
- Zentra Support: info@zentrahub.pro