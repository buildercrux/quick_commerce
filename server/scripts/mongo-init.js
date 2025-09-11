/**
 * MongoDB Initialization Script
 * Creates initial database and user for Docker setup
 */

// Switch to the ecom-multirole database
db = db.getSiblingDB('ecom-multirole');

// Create a user for the application
db.createUser({
  user: 'ecom_user',
  pwd: 'ecom_password',
  roles: [
    {
      role: 'readWrite',
      db: 'ecom-multirole'
    }
  ]
});

// Create initial collections with indexes
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('reviews');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isSuspended: 1 });

db.products.createIndex({ title: 'text', description: 'text' });
db.products.createIndex({ category: 1 });
db.products.createIndex({ owner: 1 });
db.products.createIndex({ isActive: 1 });
db.products.createIndex({ 'ratings.average': -1 });
db.products.createIndex({ price: 1 });

db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ user: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

db.reviews.createIndex({ product: 1 });
db.reviews.createIndex({ user: 1 });
db.reviews.createIndex({ rating: 1 });
db.reviews.createIndex({ isApproved: 1 });

print('✅ MongoDB initialization completed successfully!');
print('📊 Created database: ecom-multirole');
print('👤 Created user: ecom_user');
print('📋 Created collections with indexes');






