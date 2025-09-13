/**
 * Error Handling Middleware
 * Centralized error handling for the application
 * 
 * Features: Custom error classes, error logging, development vs production responses
 */

// Custom Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle MongoDB duplicate key errors
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Handle MongoDB validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle MongoDB cast errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);

    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
    });
  }
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Handle unhandled routes
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error formatter
const formatValidationErrors = (errors) => {
  const formattedErrors = {};
  
  errors.forEach(error => {
    if (error.type === 'field') {
      if (!formattedErrors[error.path]) {
        formattedErrors[error.path] = [];
      }
      formattedErrors[error.path].push(error.msg);
    }
  });
  
  return formattedErrors;
};

// Custom validation middleware
const validateRequest = (validationRules) => {
  return (req, res, next) => {
    const errors = [];
    
    // Validate each field
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = req.body[field];
      
      // Required validation
      if (rules.required && (!value || value.toString().trim() === '')) {
        errors.push({
          type: 'field',
          path: field,
          msg: `${field} is required`,
        });
        return;
      }
      
      // Skip other validations if field is empty and not required
      if (!value && !rules.required) return;
      
      // Type validation
      if (rules.type === 'email' && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        errors.push({
          type: 'field',
          path: field,
          msg: `${field} must be a valid email`,
        });
      }
      
      if (rules.type === 'number' && isNaN(value)) {
        errors.push({
          type: 'field',
          path: field,
          msg: `${field} must be a number`,
        });
      }
      
      // Length validation
      if (rules.minLength && value.toString().length < rules.minLength) {
        errors.push({
          type: 'field',
          path: field,
          msg: `${field} must be at least ${rules.minLength} characters`,
        });
      }
      
      if (rules.maxLength && value.toString().length > rules.maxLength) {
        errors.push({
          type: 'field',
          path: field,
          msg: `${field} cannot be more than ${rules.maxLength} characters`,
        });
      }
      
      // Range validation
      if (rules.min && Number(value) < rules.min) {
        errors.push({
          type: 'field',
          path: field,
          msg: `${field} must be at least ${rules.min}`,
        });
      }
      
      if (rules.max && Number(value) > rules.max) {
        errors.push({
          type: 'field',
          path: field,
          msg: `${field} cannot be more than ${rules.max}`,
        });
      }
    });
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatValidationErrors(errors),
      });
    }
    
    next();
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
  validateRequest,
};










