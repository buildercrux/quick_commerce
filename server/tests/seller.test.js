/**
 * Seller Controller Tests
 * Tests for seller registration, login, and management
 */

import request from 'supertest'
import mongoose from 'mongoose'
import app from '../index.js'
import Seller from '../models/Seller.js'

describe('Seller Controller', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom-multirole-test')
  })

  afterAll(async () => {
    // Clean up
    await mongoose.connection.db.dropDatabase()
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    // Clear sellers collection before each test
    await Seller.deleteMany({})
  })

  describe('POST /api/v1/sellers/register', () => {
    it('should register a new seller successfully', async () => {
      const sellerData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        storeName: 'John\'s Store',
        storeDescription: 'A great store',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          country: 'USA'
        },
        geo: {
          coordinates: [-74.0059, 40.7128] // NYC coordinates
        },
        serviceRadiusKm: 10
      }

      const response = await request(app)
        .post('/api/v1/sellers/register')
        .send(sellerData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.user.name).toBe(sellerData.name)
      expect(response.body.user.email).toBe(sellerData.email)
      expect(response.body.user.role).toBe('seller')
      expect(response.body.accessToken).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()

      // Verify seller was saved to database
      const savedSeller = await Seller.findOne({ email: sellerData.email })
      expect(savedSeller).toBeTruthy()
      expect(savedSeller.storeName).toBe(sellerData.storeName)
      expect(savedSeller.isApproved).toBe(false) // Default to not approved
    })

    it('should fail to register seller with duplicate email', async () => {
      const sellerData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        storeName: 'John\'s Store',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          country: 'USA'
        },
        geo: {
          coordinates: [-74.0059, 40.7128]
        }
      }

      // Create first seller
      await Seller.create(sellerData)

      // Try to create second seller with same email
      const response = await request(app)
        .post('/api/v1/sellers/register')
        .send(sellerData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('already exists')
    })

    it('should fail to register seller with invalid data', async () => {
      const invalidData = {
        name: 'J', // Too short
        email: 'invalid-email',
        phone: '123', // Invalid phone
        password: '123', // Too short
        storeName: '', // Empty
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          country: 'USA'
        },
        geo: {
          coordinates: [-74.0059, 40.7128]
        }
      }

      const response = await request(app)
        .post('/api/v1/sellers/register')
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
      expect(response.body.details).toBeDefined()
    })
  })

  describe('POST /api/v1/sellers/login', () => {
    beforeEach(async () => {
      // Create a test seller
      await Seller.create({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        storeName: 'John\'s Store',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          country: 'USA'
        },
        geo: {
          coordinates: [-74.0059, 40.7128]
        }
      })
    })

    it('should login seller with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/v1/sellers/login')
        .send(loginData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.user.email).toBe(loginData.email)
      expect(response.body.user.role).toBe('seller')
      expect(response.body.accessToken).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()
    })

    it('should fail to login with invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      }

      const response = await request(app)
        .post('/api/v1/sellers/login')
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid credentials')
    })

    it('should fail to login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/v1/sellers/login')
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid credentials')
    })

    it('should fail to login suspended seller', async () => {
      // Suspend the seller
      await Seller.findOneAndUpdate(
        { email: 'john@example.com' },
        { isSuspended: true }
      )

      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/v1/sellers/login')
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Account is suspended')
    })
  })

  describe('GET /api/v1/sellers/me', () => {
    let authToken
    let seller

    beforeEach(async () => {
      // Create and login a seller
      seller = await Seller.create({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        storeName: 'John\'s Store',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          country: 'USA'
        },
        geo: {
          coordinates: [-74.0059, 40.7128]
        }
      })

      // Get auth token
      const loginResponse = await request(app)
        .post('/api/v1/sellers/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        })

      authToken = loginResponse.body.accessToken
    })

    it('should get seller profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/sellers/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.seller.email).toBe(seller.email)
      expect(response.body.seller.name).toBe(seller.name)
    })

    it('should fail to get profile without token', async () => {
      const response = await request(app)
        .get('/api/v1/sellers/me')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Not authorized')
    })
  })
})
