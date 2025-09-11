# API Documentation

This document provides comprehensive information about the Ecom-MultiRole API endpoints.

## Base URL

- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "pagination": { ... } // For paginated responses
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... } // For validation errors
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Logout User
```http
POST /auth/logout
```

**Headers:** `Authorization: Bearer <token>`

#### Get Current User
```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

### Products

#### Get All Products
```http
GET /products
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `minRating` (number): Minimum rating filter
- `sortBy` (string): Sort by (newest, oldest, price-low, price-high, rating, popular)
- `search` (string): Search query

**Example:**
```http
GET /products?category=electronics&minPrice=100&maxPrice=1000&sortBy=price-low&page=1&limit=10
```

#### Get Single Product
```http
GET /products/:id
```

#### Get Featured Products
```http
GET /products/featured?limit=10
```

#### Get Categories
```http
GET /products/categories
```

#### Search Products
```http
GET /products/search?q=search-term&category=electronics
```

#### Create Product (Vendor/Admin)
```http
POST /products
```

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
```
title: "Product Title"
description: "Product Description"
category: "electronics"
price: 99.99
stock: 100
images: [file1, file2, ...]
specifications: [{"name": "Color", "value": "Black"}]
tags: ["tag1", "tag2"]
```

#### Update Product (Owner/Admin)
```http
PUT /products/:id
```

#### Delete Product (Owner/Admin)
```http
DELETE /products/:id
```

### Orders

#### Create Order
```http
POST /orders
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product-id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "US"
  },
  "paymentMethod": "card"
}
```

#### Get User Orders
```http
GET /orders
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (string): Filter by status
- `page` (number): Page number
- `limit` (number): Items per page

#### Get Single Order
```http
GET /orders/:id
```

**Headers:** `Authorization: Bearer <token>`

#### Cancel Order
```http
PUT /orders/:id/cancel
```

**Headers:** `Authorization: Bearer <token>`

#### Request Return
```http
POST /orders/:id/return
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "itemId": "item-id",
  "reason": "Product defect"
}
```

### User Management

#### Get User Profile
```http
GET /users/profile
```

**Headers:** `Authorization: Bearer <token>`

#### Update User Profile
```http
PUT /users/profile
```

**Headers:** `Authorization: Bearer <token>`

#### Get Shipping Addresses
```http
GET /users/addresses
```

**Headers:** `Authorization: Bearer <token>`

#### Add Shipping Address
```http
POST /users/addresses
```

**Headers:** `Authorization: Bearer <token>`

### Vendor Management

#### Get Vendor Dashboard
```http
GET /vendor/dashboard
```

**Headers:** `Authorization: Bearer <token>`

#### Get Vendor Products
```http
GET /vendor/products
```

**Headers:** `Authorization: Bearer <token>`

#### Get Vendor Orders
```http
GET /vendor/orders
```

**Headers:** `Authorization: Bearer <token>`

#### Update Order Status
```http
PUT /vendor/orders/:id/status
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "carrier": "UPS"
}
```

### Admin Management

#### Get Admin Dashboard
```http
GET /admin/dashboard
```

**Headers:** `Authorization: Bearer <token>`

#### Get All Users
```http
GET /admin/users
```

**Headers:** `Authorization: Bearer <token>`

#### Update User
```http
PUT /admin/users/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "vendor",
  "isSuspended": false
}
```

#### Get Analytics
```http
GET /admin/analytics
```

**Headers:** `Authorization: Bearer <token>`

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Sensitive Operations**: 5 attempts per 15 minutes per user

## Pagination

Paginated responses include pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## File Uploads

For file uploads (product images, avatars), use `multipart/form-data` content type:

```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('title', 'Product Title');

fetch('/api/v1/products', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>'
  },
  body: formData
});
```

## Webhooks

The API supports webhooks for real-time notifications:

- **Order Status Updates**: `POST /webhooks/order-status`
- **Payment Confirmations**: `POST /webhooks/payment`
- **User Registration**: `POST /webhooks/user-registered`

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install axios
```

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-domain.com/api/v1',
  headers: {
    'Authorization': 'Bearer <token>'
  }
});
```

### Python
```bash
pip install requests
```

```python
import requests

headers = {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
}

response = requests.get('https://your-domain.com/api/v1/products', headers=headers)
```

## Testing

Use the provided test environment for development:

- **Test API**: `https://test-api.ecom-multirole.com/api/v1`
- **Test Stripe Keys**: Use Stripe test mode keys
- **Test Data**: Use the seed script to populate test data

## Support

For API support and questions:

- **Documentation**: https://docs.ecom-multirole.com
- **Email**: api-support@ecom-multirole.com
- **GitHub Issues**: https://github.com/your-username/ecom-multirole/issues






