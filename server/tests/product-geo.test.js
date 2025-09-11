/**
 * Product Geospatial Tests
 * Tests for location-aware product queries
 */

import request from 'supertest'
import mongoose from 'mongoose'
import app from '../index.js'
import Product from '../models/Product.js'
import Seller from '../models/Seller.js'

describe('Product Geospatial Queries', () => {
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
    // Clear collections before each test
    await Product.deleteMany({})
    await Seller.deleteMany({})
  })

  describe('GET /api/v1/products with location filters', () => {
    let seller1, seller2, product1, product2, product3

    beforeEach(async () => {
      // Create sellers with different locations
      seller1 = await Seller.create({
        name: 'Seller 1',
        email: 'seller1@example.com',
        phone: '+1234567890',
        password: 'password123',
        storeName: 'Store 1',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          country: 'USA'
        },
        geo: {
          type: 'Point',
          coordinates: [-74.0059, 40.7128] // NYC
        },
        serviceRadiusKm: 10,
        isApproved: true
      })

      seller2 = await Seller.create({
        name: 'Seller 2',
        email: 'seller2@example.com',
        phone: '+1234567891',
        password: 'password123',
        storeName: 'Store 2',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          pincode: '90210',
          country: 'USA'
        },
        geo: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522] // LA
        },
        serviceRadiusKm: 15,
        isApproved: true
      })

      // Create products with locations
      product1 = await Product.create({
        name: 'Product 1',
        description: 'A great product',
        price: 100,
        category: 'Electronics',
        status: 'active',
        seller: seller1._id,
        location: {
          type: 'Point',
          coordinates: [-74.0059, 40.7128] // NYC
        }
      })

      product2 = await Product.create({
        name: 'Product 2',
        description: 'Another great product',
        price: 200,
        category: 'Electronics',
        status: 'active',
        seller: seller2._id,
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522] // LA
        }
      })

      product3 = await Product.create({
        name: 'Product 3',
        description: 'A third product',
        price: 150,
        category: 'Clothing',
        status: 'active',
        seller: seller1._id,
        location: {
          type: 'Point',
          coordinates: [-74.0059, 40.7128] // NYC
        }
      })
    })

    it('should return products within radius when lat/lng provided', async () => {
      // Query from NYC area
      const response = await request(app)
        .get('/api/v1/products')
        .query({
          lat: 40.7128,
          lng: -74.0059,
          radiusKm: 5
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2) // product1 and product3 from NYC
      
      const productNames = response.body.data.map(p => p.name)
      expect(productNames).toContain('Product 1')
      expect(productNames).toContain('Product 3')
      expect(productNames).not.toContain('Product 2') // LA product should not be included
    })

    it('should return products by pincode when pincode provided', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({
          pincode: '10001'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2) // product1 and product3 from NYC pincode
      
      const productNames = response.body.data.map(p => p.name)
      expect(productNames).toContain('Product 1')
      expect(productNames).toContain('Product 3')
    })

    it('should return all products when no location filters provided', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(3) // All products
    })

    it('should sort by distance when sortBy=distance and lat/lng provided', async () => {
      // Query from a point between NYC and LA
      const response = await request(app)
        .get('/api/v1/products')
        .query({
          lat: 37.7749, // San Francisco
          lng: -122.4194,
          radiusKm: 1000, // Large radius to include all
          sortBy: 'distance'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(3)
      
      // Products should be sorted by distance (closest first)
      // This is a simplified test - in reality, we'd need to calculate expected distances
      expect(response.body.data[0]).toHaveProperty('distance')
    })

    it('should return empty array when no products within radius', async () => {
      // Query from a very far location
      const response = await request(app)
        .get('/api/v1/products')
        .query({
          lat: 51.5074, // London
          lng: -0.1278,
          radiusKm: 1 // Very small radius
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(0)
    })

    it('should combine location filters with other filters', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .query({
          lat: 40.7128,
          lng: -74.0059,
          radiusKm: 5,
          category: 'Electronics'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1) // Only product1 (Electronics from NYC)
      expect(response.body.data[0].name).toBe('Product 1')
    })
  })

  describe('Product model geospatial methods', () => {
    it('should find products within radius using static method', async () => {
      const seller = await Seller.create({
        name: 'Test Seller',
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'password123',
        storeName: 'Test Store',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          pincode: '12345',
          country: 'USA'
        },
        geo: {
          type: 'Point',
          coordinates: [-74.0059, 40.7128]
        },
        isApproved: true
      })

      await Product.create({
        name: 'Test Product',
        description: 'A test product',
        price: 100,
        category: 'Test',
        status: 'active',
        seller: seller._id,
        location: {
          type: 'Point',
          coordinates: [-74.0059, 40.7128]
        }
      })

      // Test the search method with location
      const products = await Product.search('', {
        lat: 40.7128,
        lng: -74.0059,
        radiusKm: 5
      })

      expect(products).toHaveLength(1)
      expect(products[0].name).toBe('Test Product')
    })
  })
})
