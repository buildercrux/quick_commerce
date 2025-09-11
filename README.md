# Ecom-MultiRole

A modern, production-ready e-commerce platform with multi-role support for customers, vendors, and administrators. Built with the MERN stack and designed for scalability, security, and user experience.

![Ecom-MultiRole](https://img.shields.io/badge/Version-1.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

### 👥 Multi-Role System
- **Customer**: Browse products, manage cart, place orders, track shipments
- **Vendor**: Manage products, process orders, view analytics, handle returns
- **Admin**: User management, site-wide analytics, system configuration

### 🛍️ E-commerce Features
- Product catalog with search, filtering, and pagination
- Shopping cart with persistent storage
- Secure checkout with Stripe integration
- Order management and tracking
- Product reviews and ratings
- Return and refund system

### 🔐 Security & Authentication
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Rate limiting and security headers
- Input validation and sanitization

### 📱 Modern UI/UX
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Dark/light mode support
- Progressive Web App (PWA) ready
- Accessibility compliant

### 🏗️ Technical Features
- RESTful API with comprehensive documentation
- Real-time notifications
- Image upload with Cloudinary
- Database indexing for performance
- Docker containerization
- CI/CD pipeline ready

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **Axios** - HTTP client

### Backend
- **Node.js 18** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Stripe** - Payment processing
- **Cloudinary** - Image management

### DevOps & Tools
- **Docker** - Containerization
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Swagger** - API documentation
- **Husky** - Git hooks

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (v7.0 or higher)
- **Docker** (optional, for containerized deployment)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ecom-multirole.git
cd ecom-multirole
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Environment Setup

```bash
# Copy environment variables
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

**Required Environment Variables:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecom-multirole

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here

# Stripe (Test Keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 4. Database Setup

```bash
# Start MongoDB (if not using Docker)
mongod

# Seed the database with sample data
npm run seed
```

### 5. Start Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
# Backend: npm run server
# Frontend: npm run client
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **API Documentation**: http://localhost:5000/api-docs

## 🐳 Docker Deployment

### Development with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Run in background
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📁 Project Structure

```
ecom-multirole/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature-based Redux slices
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── app/           # Redux store configuration
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Express middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── package.json
├── docs/                 # Documentation
├── docker-compose.yml    # Docker development setup
├── docker-compose.prod.yml # Docker production setup
└── README.md
```

## 🔧 Available Scripts

### Root Level
```bash
npm run dev          # Start both client and server
npm run install-all  # Install all dependencies
npm run build        # Build client for production
npm run start        # Start production server
npm run test         # Run all tests
npm run lint         # Lint all code
npm run seed         # Seed database with sample data
```

### Client (Frontend)
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests with Vitest
npm run lint         # Lint code with ESLint
```

### Server (Backend)
```bash
npm run dev          # Start with nodemon
npm start            # Start production server
npm run test         # Run tests with Jest
npm run lint         # Lint code with ESLint
npm run seed         # Seed database
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:unit     # Unit tests
npm run test:integration # Integration tests
npm run test:e2e      # End-to-end tests
```

## 📚 API Documentation

The API documentation is automatically generated using Swagger/OpenAPI and is available at:

- **Development**: http://localhost:5000/api-docs
- **Production**: https://your-domain.com/api-docs

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

#### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create product (vendor/admin)
- `PUT /api/v1/products/:id` - Update product (owner/admin)
- `DELETE /api/v1/products/:id` - Delete product (owner/admin)

#### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:id` - Get single order
- `PUT /api/v1/orders/:id/cancel` - Cancel order

## 🔐 User Roles & Permissions

### Customer
- Browse and search products
- Add items to cart
- Place and track orders
- Write product reviews
- Manage profile and addresses

### Vendor
- Create and manage products
- Process customer orders
- View sales analytics
- Handle returns and refunds
- Manage vendor profile

### Admin
- Manage all users and vendors
- Oversee all products and orders
- Access site-wide analytics
- Configure system settings
- Handle disputes and issues

## 🚀 Deployment

### Render.com Deployment

1. Connect your GitHub repository to Render
2. Create a new Web Service for the backend
3. Create a new Static Site for the frontend
4. Configure environment variables
5. Deploy!

### AWS Elastic Beanstalk

1. Build the client: `npm run build`
2. Package the application: `zip -r app.zip .`
3. Upload to Elastic Beanstalk
4. Configure environment variables
5. Deploy!

### Vercel (Frontend Only)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `client/dist`
4. Configure environment variables
5. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Express](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Stripe](https://stripe.com/) - Payment processing
- [Cloudinary](https://cloudinary.com/) - Image management

## 📞 Support

If you have any questions or need help, please:

1. Check the [documentation](docs/)
2. Search existing [issues](https://github.com/your-username/ecom-multirole/issues)
3. Create a new issue if needed
4. Contact us at support@ecom-multirole.com

---

**Note**: This project is for educational purposes. Please ensure you have proper licenses for any third-party services used in production.






