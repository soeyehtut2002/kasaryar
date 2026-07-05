import { Router } from 'express';
import {
  initiateRoom,
  sendMessage,
  getRoomMessages,
  adminGetRooms,
  getClientRooms
} from '../controllers/chatController';
import { protect, optionalProtect, restrictTo } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Client endpoints (can be accessed by guests or logged-in members)
router.post('/initiate', optionalProtect, initiateRoom);
router.post('/messages', optionalProtect, sendMessage);
router.get('/messages/:roomId', getRoomMessages);
router.post('/my-rooms', optionalProtect, getClientRooms);

// Admin-only endpoints
router.get('/rooms', protect, restrictTo(Role.ADMIN), adminGetRooms);

export default router;
