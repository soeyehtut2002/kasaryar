import { Request, Response } from 'express';
import { AppError } from '../utils/appError';
import multer from 'multer';
import path from 'path';

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'fail',
      message: 'No file uploaded'
    });
  }

  // Construct URL. In production, this will use the backend's domain.
  // For simplicity, we just return the relative path from the server root.
  // The frontend will prepend the backend URL if needed, or we just return a full URL if we can detect it.
  
  const host = req.get('host');
  const protocol = req.protocol;
  // If we are behind a proxy (like Render), protocol might be http when it should be https,
  // but let's just return the relative path so the frontend can use it directly since it proxies /api and static files can also be proxied or accessed directly.
  // Actually, we can return `/uploads/${req.file.filename}` and the frontend can use it.
  
  const imageUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    status: 'success',
    data: {
      url: imageUrl
    }
  });
};
