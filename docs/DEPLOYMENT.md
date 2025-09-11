# Deployment Guide

This guide covers various deployment options for the Ecom-MultiRole application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Database Setup](#database-setup)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- MongoDB 7.0+ or MongoDB Atlas account
- Domain name (for production)
- SSL certificate (for HTTPS)
- Cloud provider account (AWS, GCP, Azure, etc.)

## Environment Setup

### 1. Environment Variables

Create a `.env` file in the server directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecom-multirole
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/ecom-multirole

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-here
JWT_REFRESH_EXPIRE=30d

# Server
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email
EMAIL_FROM=noreply@your-domain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Build the Application

```bash
# Install dependencies
npm run install-all

# Build the client
npm run build

# Test the build
npm test
```

## Docker Deployment

### 1. Development with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Production with Docker

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Run in background
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. Docker Environment Variables

Create a `.env.prod` file:

```env
# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure-password
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/ecom-multirole

# JWT
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## Cloud Deployment

### 1. Render.com

#### Backend Deployment

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure:
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node.js
   - **Region**: Choose closest to your users

#### Frontend Deployment

1. Create a new Static Site
2. Configure:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
   - **Environment**: Node.js

#### Environment Variables

Set these in Render dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
STRIPE_SECRET_KEY=sk_live_...
CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 2. AWS Elastic Beanstalk

#### Backend Deployment

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize EB:
```bash
eb init ecom-multirole-backend
```

3. Create environment:
```bash
eb create production
```

4. Deploy:
```bash
eb deploy
```

#### Frontend Deployment (S3 + CloudFront)

1. Build the client:
```bash
cd client && npm run build
```

2. Upload to S3:
```bash
aws s3 sync dist/ s3://your-bucket-name
```

3. Configure CloudFront distribution

### 3. Google Cloud Platform

#### Backend (Cloud Run)

1. Build and push image:
```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/ecom-multirole
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy --image gcr.io/PROJECT-ID/ecom-multirole --platform managed
```

#### Frontend (Firebase Hosting)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase init hosting
```

3. Build and deploy:
```bash
cd client && npm run build
firebase deploy
```

### 4. Vercel

#### Frontend Only

1. Connect GitHub repository
2. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`

#### Full-Stack (with API Routes)

1. Move API routes to `api/` directory
2. Configure `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

## Database Setup

### 1. MongoDB Atlas (Recommended)

1. Create MongoDB Atlas account
2. Create a new cluster
3. Configure network access (whitelist IPs)
4. Create database user
5. Get connection string
6. Update `MONGODB_URI` in environment variables

### 2. Self-Hosted MongoDB

1. Install MongoDB on your server
2. Configure authentication
3. Set up replication (for production)
4. Configure backup strategy

### 3. Database Indexes

Run the seed script to create indexes:

```bash
npm run seed
```

Or manually create indexes:

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Products
db.products.createIndex({ title: 'text', description: 'text' });
db.products.createIndex({ category: 1 });
db.products.createIndex({ owner: 1 });

// Orders
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ user: 1 });
db.orders.createIndex({ createdAt: -1 });
```

## SSL/HTTPS Setup

### 1. Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Cloudflare (Recommended)

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Configure security settings

### 3. Load Balancer SSL

For AWS/GCP/Azure:

1. Create SSL certificate in cloud provider
2. Configure load balancer
3. Terminate SSL at load balancer
4. Use HTTP between load balancer and app

## Monitoring & Logging

### 1. Application Monitoring

#### PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server/index.js --name "ecom-multirole"

# Monitor
pm2 monit

# Logs
pm2 logs
```

#### New Relic

```bash
# Install New Relic
npm install newrelic

# Configure
# Add to server/index.js
require('newrelic');
```

### 2. Log Management

#### Winston (Structured Logging)

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### Log Aggregation

- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Fluentd**: Log collection and forwarding
- **CloudWatch**: AWS logging service
- **Stackdriver**: Google Cloud logging

### 3. Error Tracking

#### Sentry

```bash
# Install Sentry
npm install @sentry/node

# Configure
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN'
});
```

## Backup & Recovery

### 1. Database Backup

#### MongoDB Atlas

- Automatic backups enabled by default
- Point-in-time recovery available
- Cross-region backup replication

#### Self-Hosted MongoDB

```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/ecom-multirole" --out=backup/

# Restore backup
mongorestore --uri="mongodb://localhost:27017/ecom-multirole" backup/ecom-multirole/
```

### 2. Application Backup

#### File Storage

- **AWS S3**: Store uploaded images
- **Google Cloud Storage**: Alternative to S3
- **Azure Blob Storage**: Microsoft's solution

#### Code Backup

- **Git**: Version control
- **GitHub/GitLab**: Remote repositories
- **Automated deployments**: CI/CD pipelines

### 3. Disaster Recovery

1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup Frequency**: Daily
4. **Test Recovery**: Monthly

## Performance Optimization

### 1. Caching

#### Redis

```bash
# Install Redis
sudo apt-get install redis-server

# Configure in application
const redis = require('redis');
const client = redis.createClient();
```

#### CDN

- **Cloudflare**: Global CDN
- **AWS CloudFront**: Amazon's CDN
- **Google Cloud CDN**: Google's solution

### 2. Database Optimization

- Use indexes effectively
- Implement connection pooling
- Monitor slow queries
- Use read replicas for scaling

### 3. Application Optimization

- Enable gzip compression
- Optimize images
- Use lazy loading
- Implement caching strategies

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Implement proper CORS
- [ ] Use secure headers
- [ ] Regular backups
- [ ] Access logging

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI
   - Verify network access
   - Check authentication credentials

2. **Build Failures**
   - Check Node.js version
   - Clear npm cache
   - Verify dependencies

3. **SSL Certificate Issues**
   - Check certificate validity
   - Verify domain configuration
   - Check certificate chain

4. **Performance Issues**
   - Monitor database queries
   - Check server resources
   - Analyze application logs

### Support

For deployment issues:

- **Documentation**: Check this guide
- **GitHub Issues**: Report bugs
- **Community**: Join discussions
- **Email**: deployment-support@ecom-multirole.com






