/**
 * Database Seeder
 * Populates the database with sample data for development and testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@ecom-multirole.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
  },
  {
    name: 'TechStore Vendor',
    email: 'vendor1@example.com',
    password: 'password123',
    role: 'vendor',
    vendorProfile: {
      businessName: 'TechStore Solutions',
      businessType: 'Electronics',
      businessAddress: {
        street: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'US',
      },
      businessPhone: '+1-555-0123',
      businessEmail: 'contact@techstore.com',
      isVerified: true,
    },
  },
  {
    name: 'Fashion Hub',
    email: 'vendor2@example.com',
    password: 'password123',
    role: 'vendor',
    vendorProfile: {
      businessName: 'Fashion Hub',
      businessType: 'Clothing',
      businessAddress: {
        street: '456 Fashion Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
      businessPhone: '+1-555-0456',
      businessEmail: 'info@fashionhub.com',
      isVerified: true,
    },
  },
];

const sampleProducts = [
  {
    title: 'iPhone 15 Pro',
    description: 'The latest iPhone with advanced camera system and A17 Pro chip.',
    category: 'electronics',
    subcategory: 'smartphones',
    price: 999,
    originalPrice: 1099,
    stock: 50,
    specifications: [
      { name: 'Display', value: '6.1-inch Super Retina XDR' },
      { name: 'Storage', value: '128GB' },
      { name: 'Camera', value: '48MP Main, 12MP Ultra Wide' },
    ],
    tags: ['smartphone', 'apple', 'premium'],
    isFeatured: true,
  },
  {
    title: 'MacBook Pro 14"',
    description: 'Powerful laptop with M3 Pro chip for professionals.',
    category: 'electronics',
    subcategory: 'laptops',
    price: 1999,
    originalPrice: 2199,
    stock: 25,
    specifications: [
      { name: 'Processor', value: 'Apple M3 Pro' },
      { name: 'Memory', value: '16GB Unified Memory' },
      { name: 'Storage', value: '512GB SSD' },
    ],
    tags: ['laptop', 'apple', 'professional'],
    isFeatured: true,
  },
  {
    title: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Max Air cushioning.',
    category: 'clothing',
    subcategory: 'shoes',
    price: 150,
    originalPrice: 180,
    stock: 100,
    specifications: [
      { name: 'Size', value: 'US 9-12' },
      { name: 'Color', value: 'Black/White' },
      { name: 'Material', value: 'Mesh and Synthetic' },
    ],
    tags: ['shoes', 'nike', 'running'],
    isFeatured: false,
  },
  {
    title: 'Samsung Galaxy S24',
    description: 'Android smartphone with AI-powered features.',
    category: 'electronics',
    subcategory: 'smartphones',
    price: 799,
    originalPrice: 899,
    stock: 75,
    specifications: [
      { name: 'Display', value: '6.2-inch Dynamic AMOLED' },
      { name: 'Storage', value: '256GB' },
      { name: 'Camera', value: '50MP Main, 12MP Ultra Wide' },
    ],
    tags: ['smartphone', 'samsung', 'android'],
    isFeatured: true,
  },
  {
    title: 'Levi\'s 501 Jeans',
    description: 'Classic straight-fit jeans in blue denim.',
    category: 'clothing',
    subcategory: 'pants',
    price: 89,
    originalPrice: 120,
    stock: 200,
    specifications: [
      { name: 'Fit', value: 'Straight' },
      { name: 'Material', value: '100% Cotton' },
      { name: 'Wash', value: 'Medium Blue' },
    ],
    tags: ['jeans', 'levis', 'denim'],
    isFeatured: false,
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`👤 Created user: ${user.name} (${user.role})`);
    }

    // Create products
    const products = [];
    const vendors = users.filter(user => user.role === 'vendor');
    
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      const vendor = vendors[i % vendors.length];
      
      const product = new Product({
        ...productData,
        owner: vendor._id,
        vendor: {
          name: vendor.vendorProfile.businessName,
          rating: 4.5,
          totalProducts: 1,
        },
      });
      
      await product.save();
      products.push(product);
      console.log(`📦 Created product: ${product.title}`);
    }

    // Create sample orders
    const customers = users.filter(user => user.role === 'customer');
    const orders = [];
    
    for (let i = 0; i < 10; i++) {
      const customer = customers[i % customers.length];
      const product = products[i % products.length];
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      const order = new Order({
        user: customer._id,
        items: [{
          product: product._id,
          vendor: product.owner,
          quantity,
          price: product.price,
          title: product.title,
          image: product.images[0]?.url,
        }],
        shippingAddress: {
          name: customer.name,
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'US',
        },
        paymentInfo: {
          paymentMethod: 'card',
          paymentIntentId: `pi_${Date.now()}_${i}`,
          paymentStatus: 'succeeded',
          paidAt: new Date(),
        },
        pricing: {
          subtotal: product.price * quantity,
          tax: Math.round(product.price * quantity * 0.085 * 100) / 100,
          shippingFee: product.price * quantity > 50 ? 0 : 9.99,
          total: product.price * quantity + Math.round(product.price * quantity * 0.085 * 100) / 100 + (product.price * quantity > 50 ? 0 : 9.99),
        },
        status: ['pending', 'confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
        vendorOrders: [{
          vendor: product.owner,
          items: [{
            product: product._id,
            quantity,
            price: product.price,
          }],
          status: ['pending', 'confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
        }],
      });
      
      await order.save();
      orders.push(order);
      console.log(`📋 Created order: ${order.orderNumber}`);
    }

    // Create sample reviews
    for (let i = 0; i < 20; i++) {
      const customer = customers[i % customers.length];
      const product = products[i % products.length];
      const order = orders[i % orders.length];
      
      const review = new Review({
        product: product._id,
        user: customer._id,
        order: order._id,
        rating: Math.floor(Math.random() * 5) + 1,
        title: `Great ${product.title}!`,
        comment: `I really love this product. It exceeded my expectations and I would definitely recommend it to others.`,
        isVerified: true,
      });
      
      await review.save();
      console.log(`⭐ Created review for: ${product.title}`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${orders.length} orders`);
    console.log(`   - ${await Review.countDocuments()} reviews`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding
connectDB().then(() => {
  seedDatabase();
});






