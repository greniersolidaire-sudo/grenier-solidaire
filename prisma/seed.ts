// prisma/seed.ts
// Données initiales : catégories, produits, admin, points de collecte, cycle
// Exécuter avec : npm run prisma:seed

import { PrismaClient, AdminRole, CycleStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Catégories ───
  const categories = [
    { id: 'huile', label: 'Huiles', sortOrder: 1 },
    { id: 'riz', label: 'Riz & Céréales', sortOrder: 2 },
    { id: 'lait', label: 'Lait & Boissons', sortOrder: 3 },
    { id: 'hygiene', label: 'Hygiène', sortOrder: 4 },
    { id: 'tomate', label: 'Conserves', sortOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories seeded');

  // ─── Produits ───
  const products = [
    { name: 'Huile Dinor', unit: 'Carton 12 bouteilles (1L)', categoryId: 'huile', bgColor: '#E8F5E9', emoji: '🫙', detailQty: '1 carton', detailPrice: 14500, grosQty: '5 cartons+', grosPrice: 12800, grosThreshold: 5 },
    { name: 'Huile Palme Rouge', unit: 'Jerrican 20L', categoryId: 'huile', bgColor: '#FFF3E0', emoji: '🛢️', detailQty: '1 jerrican', detailPrice: 18000, grosQty: '3+', grosPrice: 16200, grosThreshold: 3 },
    { name: 'Riz parfumé 25kg', unit: 'Sac de 25kg', categoryId: 'riz', bgColor: '#FFFDE7', emoji: '🌾', detailQty: '1 sac', detailPrice: 21000, grosQty: '4 sacs+', grosPrice: 18500, grosThreshold: 4 },
    { name: 'Lait Nido 900g', unit: 'Boîte 900g', categoryId: 'lait', bgColor: '#E3F2FD', emoji: '🥛', detailQty: 'x1', detailPrice: 7800, grosQty: 'Carton 6+', grosPrice: 6900, grosThreshold: 6 },
    { name: 'Savon Omo', unit: 'Carton 30 sachets', categoryId: 'hygiene', bgColor: '#F3E5F5', emoji: '🧼', detailQty: '1 carton', detailPrice: 9500, grosQty: '3+', grosPrice: 8200, grosThreshold: 3 },
    { name: 'Tomate Concentrée', unit: 'Carton 48 boîtes', categoryId: 'tomate', bgColor: '#FFEBEE', emoji: '🍅', detailQty: '1 carton', detailPrice: 11000, grosQty: '3+', grosPrice: 9600, grosThreshold: 3 },
    { name: 'Lait Gloria 400g', unit: 'Boîte 400g', categoryId: 'lait', bgColor: '#E1F5FE', emoji: '🥛', detailQty: 'x1', detailPrice: 4200, grosQty: 'Carton 12+', grosPrice: 3700, grosThreshold: 12 },
    { name: 'Savon Lux', unit: 'Carton 48 savons', categoryId: 'hygiene', bgColor: '#FCE4EC', emoji: '🧴', detailQty: '1 carton', detailPrice: 8800, grosQty: '3+', grosPrice: 7600, grosThreshold: 3 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name },
      update: {},
      create: product,
    });
  }
  console.log('✅ Products seeded');

  // ─── Points de collecte ───
  const points = [
    { name: 'Cocody — Score Supermarché', address: 'Score Supermarché, Cocody', zone: 'Cocody' },
    { name: 'Yopougon — Marché Selmer', address: 'Marché Selmer, Yopougon', zone: 'Yopougon' },
    { name: 'Adjamé — Gare nord', address: 'Gare nord, Adjamé', zone: 'Adjamé' },
    { name: 'Abobo — Centre commercial', address: 'Centre commercial, Abobo', zone: 'Abobo' },
    { name: 'Plateau — Immeuble CCIA', address: 'Immeuble CCIA, Plateau', zone: 'Plateau' },
  ];

  for (const point of points) {
    await prisma.collectionPoint.upsert({
      where: { id: point.name },
      update: {},
      create: point,
    });
  }
  console.log('✅ Collection points seeded');

  // ─── Cycle actif ───
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7 || 7);
  nextMonday.setHours(0, 0, 0, 0);

  const nextFriday = new Date(nextMonday);
  nextFriday.setDate(nextMonday.getDate() + 4);
  nextFriday.setHours(23, 59, 0, 0);

  const nextSaturday = new Date(nextMonday);
  nextSaturday.setDate(nextMonday.getDate() + 5);
  nextSaturday.setHours(8, 0, 0, 0);

  await prisma.cycle.upsert({
    where: { id: 'cycle-v0-1' },
    update: {},
    create: {
      id: 'cycle-v0-1',
      label: `Cycle ${nextMonday.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} – ${nextFriday.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      opensAt: nextMonday,
      closesAt: nextFriday,
      deliveryAt: nextSaturday,
      status: CycleStatus.OPEN,
    },
  });
  console.log('✅ Cycle seeded');

  // ─── Admin Super User ───
  const passwordHash = await bcrypt.hash('Admin@GS2025!', 12);
  await prisma.adminUser.upsert({
    where: { email: 'admin@greniersolidaire.ci' },
    update: {},
    create: {
      email: 'admin@greniersolidaire.ci',
      passwordHash,
      name: 'Super Admin',
      role: AdminRole.SUPER_ADMIN,
    },
  });
  console.log('✅ Admin user seeded');
  console.log('   Email    : admin@greniersolidaire.ci');
  console.log('   Password : Admin@GS2025!');
  console.log('   ⚠️  Change this password immediately after first login!');

  console.log('\n🎉 Database seeded successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
