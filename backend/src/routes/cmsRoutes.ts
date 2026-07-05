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
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware';

const router = Router();

// Promo Banners
router.get('/banners', getPromoBanners);
router.post('/banners', authenticate, authorizeAdmin, createPromoBanner);
router.put('/banners/:id', authenticate, authorizeAdmin, updatePromoBanner);
router.delete('/banners/:id', authenticate, authorizeAdmin, deletePromoBanner);

// Flash Sales
router.get('/flash-sales', getFlashSales);
router.post('/flash-sales', authenticate, authorizeAdmin, createFlashSale);
router.put('/flash-sales/:id', authenticate, authorizeAdmin, updateFlashSale);
router.delete('/flash-sales/:id', authenticate, authorizeAdmin, deleteFlashSale);

// Special Promo
router.get('/special-promo', getSpecialPromo);
router.put('/special-promo', authenticate, authorizeAdmin, updateSpecialPromo);

export default router;
