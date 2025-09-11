#!/usr/bin/env node

/**
 * Cloudinary Setup Script
 * Interactive script to help configure Cloudinary
 */

import readline from 'readline'
import fs from 'fs'
import path from 'path'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🚀 Cloudinary Setup for Ecom-MultiRole')
console.log('=====================================\n')

console.log('📋 Prerequisites:')
console.log('1. Cloudinary account (cloudinary.com)')
console.log('2. API Secret from Cloudinary Dashboard')
console.log('3. Upload preset "ecom-multirole" created\n')

rl.question('Enter your Cloudinary API Secret: ', (apiSecret) => {
  if (!apiSecret || apiSecret.trim() === '') {
    console.log('❌ API Secret is required!')
    rl.close()
    return
  }

  const envContent = `# Cloudinary Configuration
VITE_CLOUDINARY_API_SECRET=${apiSecret.trim()}

# Backend API URL
VITE_API_URL=http://localhost:3001
`

  try {
    fs.writeFileSync('.env', envContent)
    console.log('✅ .env file updated successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Restart your development server (npm run dev)')
    console.log('2. Test image upload in the admin products page')
    console.log('3. Check browser console for any errors')
  } catch (error) {
    console.log('❌ Error writing .env file:', error.message)
  }

  rl.close()
})

rl.on('close', () => {
  console.log('\n🎉 Setup complete! Happy coding!')
  process.exit(0)
})





