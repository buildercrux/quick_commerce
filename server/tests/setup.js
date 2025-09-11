/**
 * Jest Setup File
 * Configuration for running tests with ES modules
 */

import { jest } from '@jest/globals'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key'
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom-multirole-test'
