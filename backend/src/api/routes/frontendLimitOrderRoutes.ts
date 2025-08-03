import { Router } from 'express'
import { FrontendLimitOrderController } from '../controllers/frontendLimitOrderController'

const router = Router()
const controller = new FrontendLimitOrderController()

// Create unsigned transaction for frontend signing
router.post('/create-unsigned', controller.createUnsignedTransaction.bind(controller))

// Execute user-signed transaction
router.post('/execute-signed', controller.executeUserSignedTransaction.bind(controller))

// Get order status
router.get('/:orderId', controller.getOrderStatus.bind(controller))

export default router 