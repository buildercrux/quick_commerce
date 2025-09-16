/**
 * Ecom-MultiRole Backend Server
 * Main entry point for the Express.js API server
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import hpp from 'hpp'
import rateLimit from 'express-rate-limit'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import dotenv from 'dotenv'

// Import custom modules
import connectDB from './config/database.js'
import errorHandler from './middleware/errorHandler.js'
import notFound from './middleware/notFound.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import vendorRoutes from './routes/vendorRoutes.js'
import sellerRoutes from './routes/sellerRoutes.js'
import sellerProductRoutes from './routes/sellerProductRoutes.js'
import sellerDetailsRoutes from './routes/sellerDetailsRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import homepageSectionRoutes from './routes/homepageSectionRoutes.js'
import adminHomepageSectionRoutes from './routes/adminHomepageSectionRoutes.js'
import bannerRoutes from './routes/bannerRoutes.js'
import adminBannerRoutes from './routes/adminBannerRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import cartRoutes from './routes/cartRoutes.js'

// Load environment variables
dotenv.config()

const app = express()

// Connect to MongoDB
connectDB()

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const defaultAllowed = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      // Production frontend and backend
      'https://quick-commerce-g1od.vercel.app',
      'https://quick-commerce-seven.vercel.app',
    ]
    const envAllowed = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || []
    const allowedOrigins = [...new Set([...defaultAllowed, ...envAllowed])]

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}

app.use(cors(corsOptions))

// Rate limiting - DISABLED FOR TESTING
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// })

// app.use('/api/', limiter)

// Stricter rate limiting for auth routes - DISABLED FOR TESTING
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 50, // limit each IP to 50 requests per windowMs (increased for testing)
//   message: {
//     error: 'Too many authentication attempts, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// })

// app.use('/api/v1/auth/', authLimiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Compression middleware
app.use(compression())

// HTTP Parameter Pollution protection
app.use(hpp())

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecom-MultiRole API',
      version: '1.0.0',
      description: 'API documentation for Ecom-MultiRole e-commerce platform',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com/api/v1'
          : `http://localhost:${process.env.PORT || 3001}/api/v1`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
  },
  apis: ['./routes/*.js', './models/*.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Ecom-MultiRole API Docs'
}))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/vendor', vendorRoutes)
app.use('/api/v1/sellers', sellerRoutes)
app.use('/api/v1/seller/products', sellerProductRoutes)
app.use('/api/v1/seller-details', sellerDetailsRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/homepage-sections', homepageSectionRoutes)
app.use('/api/v1/admin/homepage-sections', adminHomepageSectionRoutes)
app.use('/api/v1/banners', bannerRoutes)
app.use('/api/v1/admin/banners', adminBannerRoutes)
app.use('/api/v1/wishlist', wishlistRoutes)
app.use('/api/v1/cart', cartRoutes)

// API Documentation JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// 404 handler
app.use(notFound)

// Global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`)
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    console.log('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...')
  server.close(() => {
    console.log('Process terminated')
    process.exit(0)
  })
})

export default app