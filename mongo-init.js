// MongoDB initialization script for Docker
db = db.getSiblingDB('zentra');

// Create collections
db.createCollection('users');
db.createCollection('apps');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

db.apps.createIndex({ "userId": 1 });
db.apps.createIndex({ "appId": 1 }, { unique: true });
db.apps.createIndex({ "isPublic": 1, "isPublished": 1 });
db.apps.createIndex({ "category": 1 });
db.apps.createIndex({ "createdAt": -1 });

print('✅ Zentra database initialized successfully!');