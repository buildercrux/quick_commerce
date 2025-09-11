# 🗄️ MongoDB Atlas Setup Guide

## Current Issue
The provided MongoDB connection string is experiencing authentication issues. This guide will help you set up a working MongoDB Atlas connection.

## 🔧 MongoDB Atlas Configuration

### Step 1: Verify Your MongoDB Atlas Account

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Check your cluster**: Ensure `Cluster0` is running
3. **Verify database user**: Check if user `buildercrux` exists and is active

### Step 2: Create/Update Database User

1. Go to **Database Access** in your MongoDB Atlas dashboard
2. Click **Add New Database User** or edit existing user `buildercrux`
3. Set authentication method to **Password**
4. Create a strong password (avoid special characters like `<`, `>`, `@` in passwords)
5. Set privileges to **Read and write to any database**

### Step 3: Network Access Configuration

1. Go to **Network Access** in your MongoDB Atlas dashboard
2. Click **Add IP Address**
3. Add your current IP address or use `0.0.0.0/0` for development (not recommended for production)

### Step 4: Get Connection String

1. Go to **Clusters** in your MongoDB Atlas dashboard
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string

## 🔗 Connection String Formats

### Option 1: Use MongoDB Atlas Generated String
```
mongodb+srv://<username>:<password>@cluster0.gdvzkdc.mongodb.net/?retryWrites=true&w=majority
```

### Option 2: Specify Database Name
```
mongodb+srv://<username>:<password>@cluster0.gdvzkdc.mongodb.net/ecom-multirole?retryWrites=true&w=majority
```

### Option 3: With App Name
```
mongodb+srv://<username>:<password>@cluster0.gdvzkdc.mongodb.net/ecom-multirole?retryWrites=true&w=majority&appName=Cluster0
```

## 🛠️ Environment Configuration

Create a `.env` file in the `server` directory:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.gdvzkdc.mongodb.net/ecom-multirole?retryWrites=true&w=majority

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

## 🧪 Testing Your Connection

### Method 1: Use the Test Script
```bash
cd server
node test-connection.js
```

### Method 2: Manual Test
```bash
cd server
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection failed:', err.message));
"
```

### Method 3: Start the Server
```bash
cd server
npm run dev
```

Look for the connection success message in the console.

## 🔒 Security Best Practices

### Password Guidelines
- Use strong passwords (12+ characters)
- Avoid special characters that need URL encoding
- Use a combination of letters, numbers, and symbols
- Consider using a password manager

### Network Security
- Restrict IP access to your development IP
- Use MongoDB Atlas IP whitelist
- Enable MongoDB Atlas encryption in transit

### Environment Variables
- Never commit `.env` files to version control
- Use different credentials for development and production
- Rotate credentials regularly

## 🐛 Troubleshooting

### Common Issues

#### 1. Authentication Failed
```
Error: bad auth : authentication failed
```
**Solutions:**
- Verify username and password in MongoDB Atlas
- Check if user has proper database permissions
- Ensure password doesn't contain special characters that need encoding

#### 2. Network Access Denied
```
Error: connection timed out
```
**Solutions:**
- Add your IP address to MongoDB Atlas Network Access
- Check firewall settings
- Verify cluster is running

#### 3. DNS Resolution Failed
```
Error: querySrv EBADNAME
```
**Solutions:**
- Check cluster name in connection string
- Verify cluster is accessible
- Try using IP address instead of hostname

#### 4. Database Not Found
```
Error: database not found
```
**Solutions:**
- MongoDB Atlas creates databases automatically
- Ensure database name is correct in connection string
- Check if database exists in MongoDB Atlas

## 🚀 Alternative: Local MongoDB Setup

If you prefer to use a local MongoDB instance:

### Install MongoDB Locally
```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

### Update Connection String
```env
MONGODB_URI=mongodb://localhost:27017/ecom-multirole
```

## 📊 Database Schema Verification

Once connected, verify the database schema:

```javascript
// Check collections
db.getCollectionNames()

// Check user collection
db.users.find().limit(1)

// Check indexes
db.users.getIndexes()
```

## 🔄 Next Steps

1. **Fix MongoDB Connection**: Update credentials and test connection
2. **Run Authentication Tests**: Use the test scripts to verify functionality
3. **Start Development Server**: Begin building your application
4. **Set Up Production Database**: Create separate production credentials

## 📞 Support

If you continue to have issues:

1. **Check MongoDB Atlas Status**: https://status.cloud.mongodb.com/
2. **Review MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com/
3. **Verify Account Status**: Ensure your MongoDB Atlas account is active
4. **Contact Support**: Use MongoDB Atlas support if needed

## 🎯 Quick Fix Checklist

- [ ] MongoDB Atlas account is active
- [ ] Database user exists and has proper permissions
- [ ] Network access allows your IP address
- [ ] Connection string is correctly formatted
- [ ] Environment variables are properly set
- [ ] Password doesn't contain problematic special characters
- [ ] Cluster is running and accessible

Once you have a working connection, the authentication system will be fully functional!






