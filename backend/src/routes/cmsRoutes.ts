import { Router } from 'express';
import {
  getPromoBanners,
  createPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
  getFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  getSpecialPromo,
  updateSpecialPromo
} from '../controllers/cmsController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();
const requireAdmin = restrictTo('ADMIN');

// Promo Banners
router.get('/banners', getPromoBanners);
router.post('/banners', protect, requireAdmin, createPromoBanner);
router.put('/banners/:id', protect, requireAdmin, updatePromoBanner);
router.delete('/banners/:id', protect, requireAdmin, deletePromoBanner);

// Flash Sales
router.get('/flash-sales', getFlashSales);
router.post('/flash-sales', protect, requireAdmin, createFlashSale);
router.put('/flash-sales/:id', protect, requireAdmin, updateFlashSale);
router.delete('/flash-sales/:id', protect, requireAdmin, deleteFlashSale);

// Special Promo
router.get('/special-promo', getSpecialPromo);
router.put('/special-promo', protect, requireAdmin, updateSpecialPromo);

export default router;
