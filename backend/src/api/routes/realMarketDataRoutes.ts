import { Router } from 'express';
import { RealMarketDataController } from '../controllers/realMarketDataController';

const router = Router();
const controller = new RealMarketDataController();

router.get('/price/:tokenAddress', controller.getPrice.bind(controller));
router.get('/volatility/:tokenAddress', controller.getVolatility.bind(controller));
router.get('/liquidity/:tokenAddress', controller.getLiquidity.bind(controller));
router.get('/comprehensive/:tokenAddress', controller.getComprehensive.bind(controller));

export default router;