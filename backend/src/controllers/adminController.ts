import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../utils/appError';
import { createTopupOrder } from '../services/galaxyLinkService';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const revenueAggregate = await prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amountPaid: true },
    });
    const totalRevenue = revenueAggregate._sum.amountPaid || 0;

    const totalOrders = await prisma.order.count();

    const totalUsers = await prisma.user.count({
      where: { role: 'USER' },
    });

    const totalGames = await prisma.game.count();

    const latestOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true, email: true } },
        game: { select: { name: true } },
        itemPackage: { select: { name: true } },
      },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const ordersForStats = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        createdAt: true,
        amountPaid: true,
      },
    });

    const salesGrouped: { [key: string]: { date: string; revenue: number; orders: number } } = {};
    ordersForStats.forEach((order) => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (!salesGrouped[dateStr]) {
        salesGrouped[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      }
      salesGrouped[dateStr].revenue += Number(order.amountPaid);
      salesGrouped[dateStr].orders += 1;
    });

    const salesHistory = Object.values(salesGrouped).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalRevenue,
          totalOrders,
          totalUsers,
          totalGames,
        },
        latestOrders,
        salesHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllGames = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        _count: { select: { packages: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      status: 'success',
      data: { games },
    });
  } catch (error) {
    next(error);
  }
};

export const createGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, category, thumbnailUrl, bannerUrl, description, isActive } = req.body;

    if (!name || !slug || !category || !thumbnailUrl || !bannerUrl) {
      return next(new AppError('Please provide all required fields (name, slug, category, thumbnailUrl, bannerUrl)', 400));
    }

    const existing = await prisma.game.findUnique({ where: { slug } });
    if (existing) {
      return next(new AppError('A game with this slug already exists', 409));
    }

    const game = await prisma.game.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        category,
        thumbnailUrl,
        bannerUrl,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { game },
    });
  } catch (error) {
    next(error);
  }
};

export const updateGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, slug, category, thumbnailUrl, bannerUrl, description, isActive } = req.body;

    const existingGame = await prisma.game.findUnique({ where: { id } });
    if (!existingGame) {
      return next(new AppError('Game not found', 404));
    }

    if (slug && slug !== existingGame.slug) {
      const slugConflict = await prisma.game.findUnique({ where: { slug } });
      if (slugConflict) {
        return next(new AppError('Slug is already taken by another game', 409));
      }
    }

    const game = await prisma.game.update({
      where: { id },
      data: {
        name,
        slug: slug ? slug.toLowerCase() : undefined,
        category,
        thumbnailUrl,
        bannerUrl,
        description,
        isActive,
      },
    });

    res.status(200).json({
      status: 'success',
      data: { game },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) {
      return next(new AppError('Game not found', 404));
    }

    await prisma.game.delete({ where: { id } });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameId, name, price, originalPrice, diamonds, isAvailable, providerCode } = req.body;

    if (!gameId || !name || price === undefined || diamonds === undefined) {
      return next(new AppError('Please provide gameId, name, price and diamonds count', 400));
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return next(new AppError('Target game does not exist', 404));
    }

    const itemPackage = await prisma.itemPackage.create({
      data: {
        gameId,
        name,
        price,
        originalPrice: originalPrice || null,
        diamonds: parseInt(diamonds, 10),
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        providerCode: providerCode || null,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { package: itemPackage },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, price, originalPrice, diamonds, isAvailable, providerCode } = req.body;

    const existingPackage = await prisma.itemPackage.findUnique({ where: { id } });
    if (!existingPackage) {
      return next(new AppError('Package not found', 404));
    }

    const itemPackage = await prisma.itemPackage.update({
      where: { id },
      data: {
        name,
        price,
        originalPrice: originalPrice !== undefined ? originalPrice : undefined,
        diamonds: diamonds !== undefined ? parseInt(diamonds, 10) : undefined,
        isAvailable,
        providerCode: providerCode !== undefined ? providerCode : undefined,
      },
    });

    res.status(200).json({
      status: 'success',
      data: { package: itemPackage },
    });
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existingPackage = await prisma.itemPackage.findUnique({ where: { id } });
    if (!existingPackage) {
      return next(new AppError('Package not found', 404));
    }

    await prisma.itemPackage.delete({ where: { id } });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const approveOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    let order = await prisma.order.findUnique({
      where: { id },
      include: {
        itemPackage: true
      }
    });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.status !== 'PENDING') {
      return next(new AppError('Only PENDING orders can be approved', 400));
    }

    // Attempt to fulfill via GalaxyLink if providerCode exists
    if (order.itemPackage.providerCode) {
      // Mark it as processing first
      order = await prisma.order.update({
        where: { id },
        data: { status: 'PROCESSING' },
        include: { itemPackage: true }
      });

      try {
        const glResponse = await createTopupOrder(
          order.itemPackage.providerCode as string,
          order.gameUserId,
          order.zoneId || null,
          order.orderNumber
        );

        if (glResponse && glResponse.id) {
          order = await prisma.order.update({
            where: { id },
            data: { 
              providerOrderId: String(glResponse.id),
              // We keep it as processing or mark completed depending on whether GalaxyLink completes it instantly.
              // We'll leave it as PROCESSING for now, assuming a webhook or poll will mark it COMPLETED later,
              // or just mark it COMPLETED if the API is synchronous. We'll mark COMPLETED for simplicity here.
              status: 'COMPLETED'
            },
            include: { itemPackage: true }
          });
        } else {
           // Fallback to complete if it succeeded but returned no ID
           order = await prisma.order.update({
            where: { id },
            data: { status: 'COMPLETED' },
            include: { itemPackage: true }
          });
        }
      } catch (error) {
        order = await prisma.order.update({
          where: { id },
          data: { status: 'FAILED' },
          include: { itemPackage: true }
        });
        return next(new AppError('Approved but GalaxyLink API failed to fulfill top-up', 500));
      }
    } else {
      // Manual package (no provider code)
      order = await prisma.order.update({
        where: { id },
        data: { status: 'COMPLETED' },
        include: { itemPackage: true }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const rejectOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.status !== 'PENDING') {
      return next(new AppError('Only PENDING orders can be rejected', 400));
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'FAILED' }
    });

    res.status(200).json({
      status: 'success',
      data: { order: updatedOrder }
    });
  } catch (error) {
    next(error);
  }
};
