import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data in order
  await prisma.order.deleteMany({});
  await prisma.itemPackage.deleteMany({});
  await prisma.game.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@kasaryar.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Created admin user: ${admin.username}`);

  // Create Standard User
  const standardUser = await prisma.user.create({
    data: {
      username: 'soeye',
      email: 'soeye@example.com',
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });
  console.log(`Created standard user: ${standardUser.username}`);

  // Create PUBG Mobile Game
  const pubg = await prisma.game.create({
    data: {
      name: 'PUBG Mobile',
      slug: 'pubg-mobile',
      category: 'Mobile',
      thumbnailUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
      description: 'PUBG Mobile is a free-to-play battle royale video game developed by LightSpeed & Quantum Studio of Tencent Games.',
      packages: {
        create: [
          { name: '60 UC', price: 0.99, originalPrice: 1.19, diamonds: 60 },
          { name: '300 + 25 UC', price: 4.99, originalPrice: 5.99, diamonds: 325 },
          { name: '600 + 60 UC', price: 9.99, originalPrice: 11.99, diamonds: 660 },
          { name: '1500 + 300 UC', price: 24.99, originalPrice: 29.99, diamonds: 1800 },
          { name: '3000 + 850 UC', price: 49.99, originalPrice: 59.99, diamonds: 3850 },
          { name: '6000 + 2100 UC', price: 99.99, originalPrice: 119.99, diamonds: 8100 },
        ],
      },
    },
  });
  console.log(`Created game: ${pubg.name}`);

  // Create Mobile Legends Game
  const mlbb = await prisma.game.create({
    data: {
      name: 'Mobile Legends: Bang Bang',
      slug: 'mobile-legends',
      category: 'Mobile',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&q=80',
      description: 'Mobile Legends: Bang Bang is a mobile multiplayer online battle arena (MOBA) game developed and published by Moonton.',
      packages: {
        create: [
          { name: '11 Diamonds', price: 0.25, diamonds: 11 },
          { name: '50 Diamonds', price: 1.00, diamonds: 50 },
          { name: '250 + 25 Diamonds', price: 4.99, originalPrice: 5.49, diamonds: 275 },
          { name: '500 + 65 Diamonds', price: 9.99, originalPrice: 10.99, diamonds: 565 },
          { name: '1000 + 155 Diamonds', price: 19.99, originalPrice: 21.99, diamonds: 1155 },
          { name: '2500 + 475 Diamonds', price: 49.99, originalPrice: 54.99, diamonds: 2975 },
          { name: '5000 + 1000 Diamonds', price: 99.99, originalPrice: 109.99, diamonds: 6000 },
        ],
      },
    },
  });
  console.log(`Created game: ${mlbb.name}`);

  // Create Free Fire Game
  const freeFire = await prisma.game.create({
    data: {
      name: 'Free Fire',
      slug: 'free-fire',
      category: 'Mobile',
      thumbnailUrl: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&q=80',
      description: 'Garena Free Fire is a battle royale game, developed by 111dots Studio and published by Garena.',
      packages: {
        create: [
          { name: '100 Diamonds', price: 0.99, diamonds: 100 },
          { name: '310 Diamonds', price: 2.99, diamonds: 310 },
          { name: '520 Diamonds', price: 4.99, diamonds: 520 },
          { name: '1060 Diamonds', price: 9.99, diamonds: 1060 },
          { name: '2180 Diamonds', price: 19.99, diamonds: 2180 },
          { name: '5600 Diamonds', price: 49.99, diamonds: 5600 },
        ],
      },
    },
  });
  console.log(`Created game: ${freeFire.name}`);

  // ── CMS: Seed Default Promo Banners ──
  await prisma.promoBanner.deleteMany({});
  await prisma.promoBanner.createMany({
    data: [
      {
        title: 'Mobile Legends Starlight',
        subtitle: 'Get 30% bonus diamonds on first recharge this month.',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
        colorTheme: 'from-blue-600/90 to-indigo-900/90',
        orderIndex: 0,
        isActive: true,
      },
      {
        title: 'PUBG Mobile UC Sale',
        subtitle: 'Exclusive outfits and weapon skins available now.',
        imageUrl: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1200&q=80',
        colorTheme: 'from-amber-600/90 to-orange-900/90',
        orderIndex: 1,
        isActive: true,
      },
      {
        title: 'Valorant Points Drop',
        subtitle: 'New Night Market is here. Top up now!',
        imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&q=80',
        colorTheme: 'from-red-600/90 to-rose-900/90',
        orderIndex: 2,
        isActive: true,
      },
    ],
  });
  console.log('Created 3 default promo banners');

  // ── CMS: Seed Default Special Promo ──
  await prisma.specialPromo.deleteMany({});
  await prisma.specialPromo.create({
    data: {
      title: 'Get 5% Cashback with KBZPay',
      description: 'Enjoy 5% cashback on all top-ups every Friday when you pay using KBZPay.',
      buttonText: 'Learn More',
      buttonLink: '#',
      isActive: true,
    },
  });
  console.log('Created default special promo');

  // ── CMS: Seed Default Flash Sales ──
  await prisma.flashSale.deleteMany({});
  const allPackages = await prisma.itemPackage.findMany({ take: 4 });
  if (allPackages.length > 0) {
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 30); // 30 days from now

    await prisma.flashSale.createMany({
      data: allPackages.map((pkg, idx) => ({
        packageId: pkg.id,
        discountPercentage: [20, 15, 25, 10][idx] || 15,
        endTime,
        isActive: true,
      })),
    });
    console.log(`Created ${allPackages.length} default flash sales`);
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
