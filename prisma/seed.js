const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default user
  const user = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Demo User',
      email: 'demo@capturepwa.app',
      settings: JSON.stringify({
        theme: 'dark',
        notifications: true,
        vibration: true,
        autoSync: true,
      }),
    },
  });
  console.log('✅ Created user:', user.name);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Personal' },
      update: {},
      create: {
        name: 'Personal',
        icon: '👤',
        description: 'Personal moments and memories',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Work' },
      update: {},
      create: {
        name: 'Work',
        icon: '💼',
        description: 'Work-related moments',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Travel' },
      update: {},
      create: {
        name: 'Travel',
        icon: '✈️',
        description: 'Travel adventures and trips',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Food' },
      update: {},
      create: {
        name: 'Food',
        icon: '🍔',
        description: 'Culinary experiences',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Fitness' },
      update: {},
      create: {
        name: 'Fitness',
        icon: '💪',
        description: 'Health and fitness activities',
      },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'important' },
      update: {},
      create: {
        name: 'important',
        color: '#ef4444',
        userId: user.id,
      },
    }),
    prisma.tag.upsert({
      where: { name: 'favorite' },
      update: {},
      create: {
        name: 'favorite',
        color: '#f59e0b',
        userId: user.id,
      },
    }),
    prisma.tag.upsert({
      where: { name: 'family' },
      update: {},
      create: {
        name: 'family',
        color: '#10b981',
        userId: user.id,
      },
    }),
    prisma.tag.upsert({
      where: { name: 'friends' },
      update: {},
      create: {
        name: 'friends',
        color: '#3b82f6',
        userId: user.id,
      },
    }),
    prisma.tag.upsert({
      where: { name: 'inspiration' },
      update: {},
      create: {
        name: 'inspiration',
        color: '#8b5cf6',
        userId: user.id,
      },
    }),
    prisma.tag.upsert({
      where: { name: 'todo' },
      update: {},
      create: {
        name: 'todo',
        color: '#ec4899',
        userId: user.id,
      },
    }),
  ]);
  console.log(`✅ Created ${tags.length} tags`);

  // Create sample moments (only if no moments exist)
  const momentCount = await prisma.moment.count();

  if (momentCount === 0) {
    console.log('📝 Creating sample moments...');

    const moment1 = await prisma.moment.create({
      data: {
        description: 'Beautiful sunrise this morning! Started the day with a sense of gratitude. 🌅',
        mood: 'happy',
        weather: 'sunny',
        gpsLat: 37.7749,
        gpsLng: -122.4194,
        userId: user.id,
        categoryId: categories[0].id, // Personal
        tags: {
          create: [
            { tagId: tags[1].id }, // favorite
            { tagId: tags[4].id }, // inspiration
          ],
        },
      },
    });

    const moment2 = await prisma.moment.create({
      data: {
        description: 'Team meeting went great! New project kickoff. Excited about the possibilities ahead.',
        mood: 'excited',
        gpsLat: 40.7128,
        gpsLng: -74.0060,
        userId: user.id,
        categoryId: categories[1].id, // Work
        tags: {
          create: [
            { tagId: tags[0].id }, // important
          ],
        },
      },
    });

    const moment3 = await prisma.moment.create({
      data: {
        description: 'Dinner with the family. Nothing beats home-cooked meals and good conversations. ❤️',
        mood: 'grateful',
        weather: 'clear',
        userId: user.id,
        categoryId: categories[3].id, // Food
        tags: {
          create: [
            { tagId: tags[1].id }, // favorite
            { tagId: tags[2].id }, // family
          ],
        },
      },
    });

    console.log(`✅ Created 3 sample moments`);
  } else {
    console.log(`ℹ️ Skipped sample moments (${momentCount} moments already exist)`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
