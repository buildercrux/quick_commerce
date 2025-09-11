/**
 * Simple server test script
 * Tests basic server functionality and database connection
 */

import axios from 'axios'

const BASE_URL = 'http://localhost:3001'

async function testServer() {
  console.log('🧪 Testing server functionality...\n')

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...')
    const healthResponse = await axios.get(`${BASE_URL}/health`)
    console.log('✅ Health check passed:', healthResponse.data)
    console.log('')

    // Test homepage sections endpoint
    console.log('2. Testing homepage sections endpoint...')
    const sectionsResponse = await axios.get(`${BASE_URL}/api/v1/homepage-sections`)
    console.log('✅ Homepage sections loaded:', sectionsResponse.data.count, 'sections')
    console.log('')

    // Test auth endpoints
    console.log('3. Testing auth endpoints...')
    
    // Test register endpoint
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/v1/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer'
      })
      console.log('✅ Register endpoint working')
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        console.log('✅ Register endpoint working (user already exists)')
      } else {
        console.log('❌ Register endpoint error:', error.response?.data || error.message)
      }
    }

    // Test login endpoint
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      })
      console.log('✅ Login endpoint working')
    } catch (error) {
      console.log('❌ Login endpoint error:', error.response?.data || error.message)
    }

    console.log('')
    console.log('🎉 Server test completed!')

  } catch (error) {
    console.error('❌ Server test failed:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 3001')
      console.log('   Run: cd server && npm run dev')
    }
  }
}

testServer()




