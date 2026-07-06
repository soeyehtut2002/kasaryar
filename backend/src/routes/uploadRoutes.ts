import express from 'express';
import { upload, uploadImage } from '../controllers/uploadController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

// Only admin can upload files
router.use(protect);
router.use(restrictTo('ADMIN'));

router.post('/', upload.single('image'), uploadImage);

export default router;
