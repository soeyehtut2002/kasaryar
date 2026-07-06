import { Request, Response } from 'express';
import { AppError } from '../utils/appError';
import multer from 'multer';

// Use memory storage instead of disk since we're forwarding to ImgBB
const storage = multer.memoryStorage();

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

export const uploadImage = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'fail',
      message: 'No file uploaded'
    });
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      status: 'error',
      message: 'IMGBB_API_KEY is not configured on the server.'
    });
  }

  try {
    // ImgBB API expects a base64 encoded string or a multipart form data
    const base64Image = req.file.buffer.toString('base64');
    
    const formData = new URLSearchParams();
    formData.append('image', base64Image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const result = (await response.json()) as any;

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Failed to upload to ImgBB');
    }

    res.status(200).json({
      status: 'success',
      data: {
        url: result.data.url
      }
    });
  } catch (error: any) {
    console.error('ImgBB Upload Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload image to Cloud Storage',
      error: error.message
    });
  }
};
