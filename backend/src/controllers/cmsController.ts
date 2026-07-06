import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// -- PROMO BANNERS --
export const getPromoBanners = async (req: any, res: any) => {
  try {
    const banners = await prisma.promoBanner.findMany({
      orderBy: { orderIndex: 'asc' },
    });
    res.json({ status: 'success', data: { banners } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch promo banners' });
  }
};

export const createPromoBanner = async (req: any, res: any) => {
  try {
    const { title, subtitle, imageUrl, colorTheme, link, orderIndex, isActive } = req.body;
    const banner = await prisma.promoBanner.create({
      data: { title, subtitle, imageUrl, colorTheme, link, orderIndex, isActive },
    });
    res.status(201).json({ status: 'success', data: { banner } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create promo banner' });
  }
};

export const updatePromoBanner = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, subtitle, imageUrl, colorTheme, link, orderIndex, isActive } = req.body;
    const banner = await prisma.promoBanner.update({
      where: { id },
      data: { title, subtitle, imageUrl, colorTheme, link, orderIndex, isActive },
    });
    res.json({ status: 'success', data: { banner } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update promo banner' });
  }
};

export const deletePromoBanner = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.promoBanner.delete({ where: { id } });
    res.json({ status: 'success', message: 'Promo banner deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete promo banner' });
  }
};

// -- FLASH SALES --
export const getFlashSales = async (req: any, res: any) => {
  try {
    const flashSales = await prisma.flashSale.findMany({
      include: {
        itemPackage: {
          include: { game: true }
        }
      },
      where: {
        endTime: { gt: new Date() } // Only get active/future ones if desired, or all for admin
      }
    });
    res.json({ status: 'success', data: { flashSales } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch flash sales' });
  }
};

export const createFlashSale = async (req: any, res: any) => {
  try {
    const { packageId, discountPercentage, endTime, customIconUrl, isActive } = req.body;
    const flashSale = await prisma.flashSale.create({
      data: { packageId, discountPercentage, endTime: new Date(endTime), customIconUrl, isActive },
    });
    res.status(201).json({ status: 'success', data: { flashSale } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create flash sale' });
  }
};

export const updateFlashSale = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { discountPercentage, endTime, customIconUrl, isActive } = req.body;
    const flashSale = await prisma.flashSale.update({
      where: { id },
      data: { discountPercentage, endTime: new Date(endTime), customIconUrl, isActive },
    });
    res.json({ status: 'success', data: { flashSale } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update flash sale' });
  }
};

export const deleteFlashSale = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.flashSale.delete({ where: { id } });
    res.json({ status: 'success', message: 'Flash sale deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete flash sale' });
  }
};

// -- SPECIAL PROMO --
export const getSpecialPromo = async (req: any, res: any) => {
  try {
    const promos = await prisma.specialPromo.findMany({ take: 1 });
    res.json({ status: 'success', data: { promo: promos[0] || null } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch special promo' });
  }
};

export const updateSpecialPromo = async (req: any, res: any) => {
  try {
    const { title, description, buttonText, buttonLink, isActive } = req.body;
    
    // Check if one exists
    const existing = await prisma.specialPromo.findMany({ take: 1 });
    let promo;
    
    if (existing.length > 0) {
      promo = await prisma.specialPromo.update({
        where: { id: existing[0].id },
        data: { title, description, buttonText, buttonLink, isActive },
      });
    } else {
      promo = await prisma.specialPromo.create({
        data: { title, description, buttonText, buttonLink, isActive },
      });
    }
    
    res.json({ status: 'success', data: { promo } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update special promo' });
  }
};
