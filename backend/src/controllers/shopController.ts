import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../utils/appError';

export const getGames = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const games = await prisma.game.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        thumbnailUrl: true,
        description: true,
        packages: {
          select: {
            id: true,
            name: true,
            price: true,
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      status: 'success',
      results: games.length,
      data: { games },
    });
  } catch (error) {
    next(error);
  }
};

export const getGameDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const game = await prisma.game.findUnique({
      where: { slug, isActive: true },
      include: {
        packages: {
          where: { isAvailable: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!game) {
      return next(new AppError('Game not found or inactive', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { game },
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameId, packageId, gameUserId, zoneId, paymentMethod } = req.body;

    if (!gameId || !packageId || !gameUserId || !paymentMethod) {
      return next(new AppError('Please provide gameId, packageId, gameUserId and paymentMethod', 400));
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId, isActive: true },
    });
    if (!game) {
      return next(new AppError('Game not found or inactive', 404));
    }

    const itemPackage = await prisma.itemPackage.findUnique({
      where: { id: packageId, gameId, isAvailable: true },
    });
    if (!itemPackage) {
      return next(new AppError('Package not found or unavailable', 404));
    }

    const orderNumber = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = req.user ? req.user.id : null;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        gameId,
        packageId,
        gameUserId,
        zoneId: zoneId || null,
        amountPaid: itemPackage.price,
        paymentMethod,
        status: 'COMPLETED',
      },
      include: {
        game: { select: { name: true, slug: true } },
        itemPackage: { select: { name: true, diamonds: true } },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('You must be logged in to view your orders', 401));
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        game: { select: { name: true, thumbnailUrl: true } },
        itemPackage: { select: { name: true, diamonds: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};
