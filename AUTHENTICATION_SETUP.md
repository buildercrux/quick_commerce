# 🔐 Authentication System Setup Guide

## Overview
This guide explains how to set up and test the email/password authentication system with your MongoDB Atlas database.

## 🗄️ Database Configuration

### MongoDB Connection
- **Connection String**: `mongodb+srv://buildercrux:<This@1234>@cluster0.gdvzkdc.mongodb.net/ecom-multirole?retryWrites=true&w=majority&appName=Cluster0`
- **Database Name**: `ecom-multirole`
- **Cluster**: Cluster0 on MongoDB Atlas

### Environment Variables
Create a `.env` file in the `server` directory with:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://buildercrux:<This@1234>@cluster0.gdvzkdc.mongodb.net/ecom-multirole?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=ecom-multirole

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-67890
JWT_REFRESH_EXPIRE=7d

# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Security
BCRYPT_ROUNDS=12
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Test Database Connection
```bash
node test-auth.js
```

This will test:
- ✅ MongoDB connection
- ✅ User registration
- ✅ Password hashing
- ✅ JWT token generation
- ✅ Authentication flow

### 3. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 🔧 Authentication API Endpoints

### Public Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
PUT /api/v1/auth/reset-password
Content-Type: application/json

{
  "resetToken": "your-reset-token",
  "password": "newpassword123"
}
```

### Protected Endpoints (Require Authentication)

#### Get Current User
```http
GET /api/v1/auth/me
Cookie: token=your-jwt-token
```

#### Update Password
```http
PUT /api/v1/auth/update-password
Content-Type: application/json
Cookie: token=your-jwt-token

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Update Profile
```http
PUT /api/v1/auth/update-profile
Content-Type: multipart/form-data
Cookie: token=your-jwt-token

{
  "name": "John Smith"
}
```

#### Logout
```http
POST /api/v1/auth/logout
Cookie: token=your-jwt-token
```

## 🧪 Testing with cURL

### Register a New User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

### Get Current User (using cookie)
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -b cookies.txt
```

## 🔒 Security Features

### Password Security
- **Hashing**: bcrypt with 12 salt rounds
- **Minimum Length**: 6 characters
- **Validation**: Server-side validation with express-validator

### JWT Tokens
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- **Storage**: HTTP-only cookies for security
- **Rotation**: New refresh token on each refresh

### Role-Based Access Control
- **Customer**: Default role, can browse and purchase
- **Vendor**: Can manage products and orders
- **Admin**: Full system access

### Rate Limiting
- **Authentication Routes**: 100 requests per 15 minutes
- **Sensitive Operations**: 5 attempts per 15 minutes

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (required, unique, lowercase),
  password: String (required, min 6 chars, hashed),
  role: String (enum: ['customer', 'vendor', 'admin']),
  avatar: {
    public_id: String,
    url: String
  },
  isSuspended: Boolean (default: false),
  isEmailVerified: Boolean (default: false),
  refreshTokens: [{
    token: String,
    createdAt: Date
  }],
  lastLogin: Date,
  loginCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `email` (unique)
- `role`
- `isSuspended`
- `refreshTokens.token`

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
Error: connect ECONNREFUSED
```
**Solution**: Check your MongoDB Atlas connection string and network access settings.

#### 2. JWT Secret Not Set
```
Error: secretOrPrivateKey must have a value
```
**Solution**: Set `JWT_SECRET` and `JWT_REFRESH_SECRET` in your `.env` file.

#### 3. User Already Exists
```
Error: User already exists with this email
```
**Solution**: Use a different email or delete the existing user from the database.

#### 4. Invalid Credentials
```
Error: Invalid credentials
```
**Solution**: Check email and password are correct, user exists, and account is not suspended.

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages and logs.

## 🔄 Frontend Integration

### Redux Store Setup
The frontend Redux store is already configured to work with the authentication system:

```javascript
// Store structure
{
  auth: {
    user: UserObject,
    isAuthenticated: Boolean,
    isLoading: Boolean,
    error: String
  }
}
```

### API Service
The frontend API service automatically includes authentication headers:

```javascript
// Automatic token inclusion
axios.defaults.withCredentials = true;
```

## 📈 Next Steps

1. **Test the authentication system** with the provided test script
2. **Start the server** and test API endpoints
3. **Integrate with frontend** React components
4. **Add email verification** (optional)
5. **Implement password reset** via email (optional)
6. **Add two-factor authentication** (optional)

## 🆘 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify your MongoDB connection string
3. Ensure all environment variables are set
4. Run the test script to verify the setup

The authentication system is now ready to use with your MongoDB Atlas database!






