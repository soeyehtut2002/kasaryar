import express from 'express';
import { upload, uploadImage } from '../controllers/uploadController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

// Public route for payment slips
router.post('/slip', upload.single('image'), uploadImage);

// Only admin can upload other files
router.use(protect);
router.use(restrictTo('ADMIN'));

router.post('/', upload.single('image'), uploadImage);

export default router;
