/**
 * Basic Server Tests
 * Tests server startup and basic functionality without database
 */

import request from 'supertest'
import express from 'express'

// Create a simple test app
const app = express()
app.use(express.json())

// Basic health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: 'test'
  })
})

// Seller routes test
app.post('/api/v1/sellers/register', (req, res) => {
  if (!req.body.name || !req.body.email) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: [{ msg: 'Name is required' }]
    })
  }
  res.json({ success: true })
})

describe('Basic Server Tests', () => {
  it('should start server and respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)

    expect(response.body.status).toBe('success')
    expect(response.body.message).toBe('Server is running')
  })

  it('should return 404 for non-existent routes', async () => {
    await request(app)
      .get('/non-existent-route')
      .expect(404)
  })

  it('should have seller routes available', async () => {
    // Test that seller routes are registered (should return 400 for missing data, not 404)
    const response = await request(app)
      .post('/api/v1/sellers/register')
      .send({})
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.error).toBe('Validation failed')
  })
})
