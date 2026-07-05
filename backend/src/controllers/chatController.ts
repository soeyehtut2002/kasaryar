import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initiate or retrieve a chat room
export const initiateRoom = async (req: Request, res: Response) => {
  try {
    const { roomId, clientName } = req.body;
    const userId = (req as any).user?.id; // Optional user ID if authenticated
    const username = (req as any).user?.username || clientName || 'Guest Support';

    // If user is authenticated, check if they already have an active chat room
    if (userId) {
      const existingUserRoom = await prisma.chatRoom.findFirst({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (existingUserRoom) {
        return res.status(200).json({
          status: 'success',
          data: { room: existingUserRoom }
        });
      }
    }

    // If a roomId is provided, check if it exists
    if (roomId) {
      const existingRoom = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (existingRoom) {
        return res.status(200).json({
          status: 'success',
          data: { room: existingRoom }
        });
      }
    }

    // Create a new room
    const newRoom = await prisma.chatRoom.create({
      data: {
        id: roomId || undefined,
        clientName: username,
        userId: userId || null
      },
      include: {
        messages: true
      }
    });

    return res.status(201).json({
      status: 'success',
      data: { room: newRoom }
    });
  } catch (error: any) {
    console.error('Error initiating chat room:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to initiate chat room'
    });
  }
};

// Send a message inside a room
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { roomId, message } = req.body;
    const user = (req as any).user;
    const isAdmin = user?.role === 'ADMIN';

    if (!roomId || !message || message.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Room ID and message text are required'
      });
    }

    // Verify room exists
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chat room not found'
      });
    }

    // Save message and touch room's updatedAt
    const [newMessage] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          roomId,
          message: message.trim(),
          isAdmin
        }
      }),
      prisma.chatRoom.update({
        where: { id: roomId },
        data: { updatedAt: new Date() }
      })
    ]);

    return res.status(201).json({
      status: 'success',
      data: { message: newMessage }
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to deliver message'
    });
  }
};

// Fetch messages for a specific room
export const getRoomMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!room) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chat room not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { messages: room.messages }
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve message history'
    });
  }
};

// Admin route to list all active rooms sorted by last activity
export const adminGetRooms = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'fail',
        message: 'Unauthorized access'
      });
    }

    const rooms = await prisma.chatRoom.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return res.status(200).json({
      status: 'success',
      data: { rooms }
    });
  } catch (error: any) {
    console.error('Error listing rooms:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to load support chat list'
    });
  }
};

// Client route to list rooms associated with user (by userId or list of IDs)
export const getClientRooms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { roomIds } = req.body; // Array of guest room UUIDs from client localStorage
    
    const parsedRoomIds = Array.isArray(roomIds) ? roomIds : [];

    const rooms = await prisma.chatRoom.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(parsedRoomIds.length > 0 ? [{ id: { in: parsedRoomIds } }] : [])
        ]
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return res.status(200).json({
      status: 'success',
      data: { rooms }
    });
  } catch (error: any) {
    console.error('Error fetching client rooms:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to load conversation history'
    });
  }
};
