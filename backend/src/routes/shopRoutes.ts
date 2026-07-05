import { Router } from 'express';
import { getGames, getGameDetail, createOrder, getUserOrders } from '../controllers/shopController';
import { protect, optionalProtect } from '../middleware/auth';

const router = Router();

router.get('/games', getGames);
router.get('/games/:slug', getGameDetail);
router.post('/orders', optionalProtect, createOrder);
router.get('/orders/my-orders', protect, getUserOrders);

export default router;
