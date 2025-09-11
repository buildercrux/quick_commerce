/**
 * Create Admin User Script
 * Creates an admin user for testing
 */

import mongoose from 'mongoose'
import User from '../models/User.js'

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://buildercrux:This%401234@cluster0.gdvzkdc.mongodb.net/ecom-multirole?retryWrites=true&w=majority&appName=Cluster0')
    console.log('✅ MongoDB Connected')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

const createAdmin = async () => {
  try {
    await connectDB()
    
    console.log('👤 Creating admin user...')
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      return
    }
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    })
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminUser.email)
    console.log('🔑 Password: admin123')
    console.log('👑 Role:', adminUser.role)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

// Run the function
createAdmin()





