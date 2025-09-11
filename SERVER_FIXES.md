# Server and Authentication Fixes

## 🔧 Issues Fixed

### 1. **Server Configuration Issues**
- ✅ Fixed port mismatch (server uses 3001, not 5000)
- ✅ Updated environment variable usage
- ✅ Improved CORS configuration
- ✅ Enhanced error handling

### 2. **Authentication Issues**
- ✅ Fixed JWT token handling
- ✅ Improved refresh token logic
- ✅ Enhanced cookie-based authentication
- ✅ Better error responses

### 3. **Database Connection**
- ✅ Updated MongoDB connection string
- ✅ Improved connection error handling
- ✅ Added proper environment variable support

## 🚀 How to Start the Servers

### Option 1: Using the Start Script (Recommended)
```bash
./start-servers.sh
```

### Option 2: Manual Start

#### Backend Server
```bash
cd server
npm install
npm run dev
```

#### Frontend Server (in a new terminal)
```bash
cd client
npm install
npm run dev
```

## 🌐 Server URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## 🧪 Testing the Server

Run the test script to verify everything is working:

```bash
node test-server.js
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. **Port Already in Use**
```bash
# Kill processes using ports 3001 and 5173
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

#### 2. **Database Connection Issues**
- Check if MongoDB Atlas cluster is running
- Verify connection string in server/config/database.js
- Check network connectivity

#### 3. **CORS Errors**
- Ensure frontend is running on http://localhost:5173
- Check CORS configuration in server/index.js
- Clear browser cache and cookies

#### 4. **Authentication Issues**
- Clear browser cookies and localStorage
- Check if JWT secrets are properly configured
- Verify cookie settings (httpOnly, secure, sameSite)

#### 5. **Homepage Not Loading Data**
- Check browser network tab for API errors
- Verify homepage sections API endpoint
- Check if database has homepage sections data

### Debug Steps

1. **Check Server Logs**
   ```bash
   cd server
   npm run dev
   # Look for error messages in console
   ```

2. **Check Frontend Console**
   - Open browser DevTools
   - Check Console and Network tabs
   - Look for JavaScript errors or failed API calls

3. **Test API Endpoints**
   ```bash
   # Test health endpoint
   curl http://localhost:3001/health
   
   # Test homepage sections
   curl http://localhost:3001/api/v1/homepage-sections
   ```

4. **Check Database Connection**
   - Visit http://localhost:3001/health
   - Should show "Server is running" status

## 📝 Environment Variables

Create a `.env` file in the root directory with:

```env
# Database
MONGODB_URI=mongodb+srv://buildercrux:This%401234@cluster0.gdvzkdc.mongodb.net/ecom-multirole?retryWrites=true&w=majority&appName=Cluster0

# JWT
JWT_SECRET=4698ea6e4878d1748bafed9749df00efea82c83a4745ec7a8de4a9fc4309b3f53afdf8855dca5b99dd0f911b25912ac51c036a91a7b8ab99ea3427a370fc0211
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=4698ea6e4878d1748bafed9749df00efea82c83a4745ec7a8de4a9fc4309b3f53afdf8855dca5b99dd0f911b25912ac51c036a91a7b8ab99ea3427a370fc0211
JWT_REFRESH_EXPIRE=30d

# Server
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000
```

## 🎯 Key Changes Made

### Backend Changes
1. **server/config/database.js**: Added environment variable support
2. **server/middleware/auth.js**: Updated JWT secret handling
3. **server/models/User.js**: Added environment variable support
4. **server/controllers/authController.js**: Fixed refresh token logic
5. **server/index.js**: Improved CORS configuration

### Frontend Changes
1. **client/src/services/api.js**: Enhanced error handling
2. **client/src/services/authAPI.js**: Improved API calls
3. **client/vite.config.js**: Proper proxy configuration

## ✅ Verification Checklist

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Database connection successful
- [ ] Health endpoint returns 200
- [ ] Homepage sections API returns data
- [ ] Login/register functionality works
- [ ] No CORS errors in browser console
- [ ] Authentication state persists on page refresh

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. Check the server logs for specific error messages
2. Verify all dependencies are installed (`npm install` in both directories)
3. Ensure Node.js version is 18+ (`node --version`)
4. Clear browser cache and cookies
5. Try accessing the API directly with curl or Postman

## 📞 Support

For additional help, check:
- Server logs in terminal
- Browser console for frontend errors
- Network tab for failed API calls
- Database connection status




