import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getMyCart,
  replaceMyCart,
  addItemToMyCart,
  updateItemInMyCart,
  clearMyCart,
} from '../controllers/cartController.js'

const router = express.Router()

router.use(protect)

// Get my cart
router.get('/me', getMyCart)

// Replace my cart
router.put('/me', replaceMyCart)

// Add item
router.post('/me/items', addItemToMyCart)

// Update item quantity or remove (quantity <= 0)
router.patch('/me/items', updateItemInMyCart)

// Clear cart
router.delete('/me', clearMyCart)

export default router


