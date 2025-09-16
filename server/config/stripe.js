/**
 * Stripe Configuration
 * Payment processing setup with Stripe API
 * 
 * Required environment variables:
 * - STRIPE_SECRET_KEY
 * - STRIPE_PUBLISHABLE_KEY
 * - STRIPE_WEBHOOK_SECRET
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe configuration options
const stripeConfig = {
  apiVersion: '2023-10-16',
  typescript: false,
  maxNetworkRetries: 3,
  timeout: 20000,
};

// Payment intent configuration
const paymentIntentConfig = {
  currency: 'usd',
  automatic_payment_methods: {
    enabled: true,
  },
  metadata: {
    platform: 'ecom-multirole',
  },
};

// Webhook configuration
const webhookConfig = {
  apiVersion: '2023-10-16',
  typescript: false,
};

module.exports = {
  stripe,
  stripeConfig,
  paymentIntentConfig,
  webhookConfig,
};
















