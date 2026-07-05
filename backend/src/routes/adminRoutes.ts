import { Router } from 'express';
import {
  getDashboardStats,
  getAllGames,
  createGame,
  updateGame,
  deleteGame,
  createPackage,
  updatePackage,
  deletePackage,
} from '../controllers/adminController';
import { protect, restrictTo } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(protect, restrictTo(Role.ADMIN));

router.get('/dashboard', getDashboardStats);

router.get('/games', getAllGames);
router.post('/games', createGame);
router.put('/games/:id', updateGame);
router.delete('/games/:id', deleteGame);

router.post('/packages', createPackage);
router.put('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);

export default router;
