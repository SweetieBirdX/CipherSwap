import { Router } from 'express';
import { RealOnchainExecutionController } from '../controllers/realOnchainExecutionController';

const router = Router();
const controller = new RealOnchainExecutionController();

// Gas estimation endpoint
router.post('/estimate-gas', controller.estimateGas.bind(controller));

// Execute limit order onchain
router.post('/execute-order', controller.executeOrder.bind(controller));

// Get transaction status
router.get('/transaction-status/:txHash', controller.getTransactionStatus.bind(controller));

// Cancel limit order
router.post('/cancel-order', controller.cancelOrder.bind(controller));

export default router; 