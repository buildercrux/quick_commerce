#!/usr/bin/env node

/**
 * Test Cloudinary Setup
 * This script tests if Cloudinary is properly configured
 */

import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Configuration
cloudinary.config({ 
    cloud_name: 'drsarxk57', 
    api_key: '221264995981298', 
    api_secret: process.env.VITE_CLOUDINARY_API_SECRET
})

async function testCloudinarySetup() {
    try {
        console.log('🧪 Testing Cloudinary Configuration...')
        console.log(`   Cloud Name: ${cloudinary.config().cloud_name}`)
        console.log(`   API Key: ${cloudinary.config().api_key}`)
        console.log(`   API Secret: ${process.env.VITE_CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set'}`)
        
        if (!process.env.VITE_CLOUDINARY_API_SECRET) {
            console.log('\n❌ API Secret not found!')
            console.log('Please set VITE_CLOUDINARY_API_SECRET in your .env file')
            return
        }
        
        // Test API connection
        console.log('\n🔗 Testing API connection...')
        const result = await cloudinary.api.ping()
        
        if (result.status === 'ok') {
            console.log('✅ Cloudinary API connection successful!')
            
            // Test upload preset
            console.log('\n📋 Checking upload preset...')
            try {
                const preset = await cloudinary.api.upload_preset('ecom-multirole')
                console.log('✅ Upload preset "ecom-multirole" found!')
                console.log(`   Unsigned: ${preset.unsigned}`)
                console.log(`   Folder: ${preset.folder}`)
            } catch (error) {
                console.log('❌ Upload preset "ecom-multirole" not found!')
                console.log('Please create it manually in the Cloudinary dashboard')
            }
            
        } else {
            console.log('❌ Cloudinary API connection failed!')
        }
        
    } catch (error) {
        console.error('❌ Error testing Cloudinary setup:', error.message)
    }
}

// Run the test
testCloudinarySetup()





