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

    // Helper to create moments with proper date spacing
    const createMomentWithDate = async (data, daysAgo = 0) => {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      return await prisma.moment.create({
        data: {
          ...data,
          createdAt,
          updatedAt: createdAt,
        },
      });
    };

    // 1. Beautiful sunrise - San Francisco
    await createMomentWithDate({
      description: 'Beautiful sunrise this morning! Started the day with a sense of gratitude. 🌅',
      mood: 'happy',
      weather: 'sunny',
      gpsLat: 37.7749,
      gpsLng: -122.4194,
      gpsAccuracy: 15.0,
      locationName: 'San Francisco, CA, USA',
      userId: user.id,
      categoryId: categories[0].id, // Personal
      tags: {
        create: [
          { tagId: tags[1].id }, // favorite
          { tagId: tags[4].id }, // inspiration
        ],
      },
    }, 0);

    // 2. Team meeting - New York
    await createMomentWithDate({
      description: 'Team meeting went great! New project kickoff. Excited about the possibilities ahead.',
      mood: 'excited',
      weather: 'cloudy',
      gpsLat: 40.7128,
      gpsLng: -74.0060,
      gpsAccuracy: 25.0,
      locationName: 'New York, NY, USA',
      userId: user.id,
      categoryId: categories[1].id, // Work
      tags: {
        create: [
          { tagId: tags[0].id }, // important
        ],
      },
    }, 1);

    // 3. Family dinner - Chicago
    await createMomentWithDate({
      description: 'Dinner with the family. Nothing beats home-cooked meals and good conversations. ❤️',
      mood: 'grateful',
      weather: 'clear',
      gpsLat: 41.8781,
      gpsLng: -87.6298,
      gpsAccuracy: 10.0,
      locationName: 'Chicago, IL, USA',
      userId: user.id,
      categoryId: categories[3].id, // Food
      tags: {
        create: [
          { tagId: tags[1].id }, // favorite
          { tagId: tags[2].id }, // family
        ],
      },
    }, 2);

    // 4. Mountain hike - Denver
    await createMomentWithDate({
      description: 'Conquered the trail! The view from the top was absolutely breathtaking. Nature therapy at its finest. 🏔️',
      mood: 'energized',
      weather: 'sunny',
      gpsLat: 39.7392,
      gpsLng: -104.9903,
      gpsAccuracy: 50.0,
      locationName: 'Denver, CO, USA',
      userId: user.id,
      categoryId: categories[4].id, // Fitness
      tags: {
        create: [
          { tagId: tags[1].id }, // favorite
          { tagId: tags[4].id }, // inspiration
        ],
      },
    }, 3);

    // 5. Coffee shop work - Seattle
    await createMomentWithDate({
      description: 'Productive afternoon at the coffee shop. Sometimes a change of scenery is all you need. ☕',
      mood: 'focused',
      weather: 'rainy',
      gpsLat: 47.6062,
      gpsLng: -122.3321,
      gpsAccuracy: 20.0,
      locationName: 'Seattle, WA, USA',
      userId: user.id,
      categoryId: categories[1].id, // Work
      tags: {
        create: [
          { tagId: tags[5].id }, // todo
        ],
      },
    }, 4);

    // 6. Beach sunset - Los Angeles
    await createMomentWithDate({
      description: 'Beach sunset with friends. Living for these golden hour moments! 🌊✨',
      mood: 'relaxed',
      weather: 'sunny',
      gpsLat: 34.0522,
      gpsLng: -118.2437,
      gpsAccuracy: 30.0,
      locationName: 'Los Angeles, CA, USA',
      userId: user.id,
      categoryId: categories[2].id, // Travel
      isPublic: true,
      shareToken: 'beach-sunset-' + Date.now(),
      tags: {
        create: [
          { tagId: tags[1].id }, // favorite
          { tagId: tags[3].id }, // friends
        ],
      },
    }, 5);

    // 7. Late night coding - Austin
    await createMomentWithDate({
      description: 'Finally fixed that bug that has been haunting me all week! Time to celebrate with pizza 🍕',
      mood: 'accomplished',
      weather: 'clear',
      gpsLat: 30.2672,
      gpsLng: -97.7431,
      gpsAccuracy: 12.0,
      locationName: 'Austin, TX, USA',
      userId: user.id,
      categoryId: categories[1].id, // Work
      tags: {
        create: [
          { tagId: tags[0].id }, // important
          { tagId: tags[4].id }, // inspiration
        ],
      },
    }, 6);

    // 8. Morning run - Boston
    await createMomentWithDate({
      description: 'Early morning run along the river. Fresh air and endorphins are the best combo! 🏃‍♂️',
      mood: 'energized',
      weather: 'cloudy',
      gpsLat: 42.3601,
      gpsLng: -71.0589,
      gpsAccuracy: 8.0,
      locationName: 'Boston, MA, USA',
      userId: user.id,
      categoryId: categories[4].id, // Fitness
      tags: {
        create: [
          { tagId: tags[4].id }, // inspiration
        ],
      },
    }, 7);

    // 9. Street food adventure - Portland
    await createMomentWithDate({
      description: 'Found this amazing food cart! The tacos are incredible. Must come back here soon. 🌮',
      mood: 'delighted',
      weather: 'sunny',
      gpsLat: 45.5152,
      gpsLng: -122.6784,
      gpsAccuracy: 18.0,
      locationName: 'Portland, OR, USA',
      userId: user.id,
      categoryId: categories[3].id, // Food
      tags: {
        create: [
          { tagId: tags[1].id }, // favorite
        ],
      },
    }, 8);

    // 10. Rainy day thoughts - Miami
    await createMomentWithDate({
      description: 'Rainy days make me reflective. Sometimes it\'s okay to just slow down and think.',
      mood: 'contemplative',
      weather: 'rainy',
      gpsLat: 25.7617,
      gpsLng: -80.1918,
      gpsAccuracy: 22.0,
      locationName: 'Miami, FL, USA',
      userId: user.id,
      categoryId: categories[0].id, // Personal
      tags: {
        create: [
          { tagId: tags[4].id }, // inspiration
        ],
      },
    }, 9);

    // 11. Airport excitement - Phoenix
    await createMomentWithDate({
      description: 'Off to new adventures! There\'s something magical about airports and new beginnings. ✈️',
      mood: 'excited',
      weather: 'sunny',
      gpsLat: 33.4484,
      gpsLng: -112.0740,
      gpsAccuracy: 100.0,
      locationName: 'Phoenix, AZ, USA',
      userId: user.id,
      categoryId: categories[2].id, // Travel
      isPublic: true,
      shareToken: 'airport-adventure-' + Date.now(),
      tags: {
        create: [
          { tagId: tags[0].id }, // important
          { tagId: tags[1].id }, // favorite
        ],
      },
    }, 10);

    // 12. Gym milestone - Philadelphia
    await createMomentWithDate({
      description: 'Hit a new personal record at the gym today! All the hard work is paying off! 💪',
      mood: 'proud',
      weather: 'clear',
      gpsLat: 39.9526,
      gpsLng: -75.1652,
      gpsAccuracy: 15.0,
      locationName: 'Philadelphia, PA, USA',
      userId: user.id,
      categoryId: categories[4].id, // Fitness
      tags: {
        create: [
          { tagId: tags[0].id }, // important
          { tagId: tags[4].id }, // inspiration
        ],
      },
    }, 11);

    // 13. Birthday celebration - Las Vegas
    await createMomentWithDate({
      description: 'Birthday dinner with my favorite people! Grateful for another year and all the love. 🎂🎉',
      mood: 'joyful',
      weather: 'clear',
      gpsLat: 36.1699,
      gpsLng: -115.1398,
      gpsAccuracy: 35.0,
      locationName: 'Las Vegas, NV, USA',
      userId: user.id,
      categoryId: categories[3].id, // Food
      tags: {
        create: [
          { tagId: tags[1].id }, // favorite
          { tagId: tags[2].id }, // family
          { tagId: tags[3].id }, // friends
        ],
      },
    }, 12);

    // 14. Quiet morning - San Diego
    await createMomentWithDate({
      description: 'Peaceful morning with coffee and a good book. Sometimes the simple things are the best things. 📖',
      mood: 'peaceful',
      weather: 'sunny',
      gpsLat: 32.7157,
      gpsLng: -117.1611,
      gpsAccuracy: 10.0,
      locationName: 'San Diego, CA, USA',
      userId: user.id,
      categoryId: categories[0].id, // Personal
      tags: {
        create: [
          { tagId: tags[4].id }, // inspiration
        ],
      },
    }, 13);

    // 15. Concert night - Nashville
    await createMomentWithDate({
      description: 'Live music hits different! What an incredible performance. My soul is happy! 🎵🎸',
      mood: 'euphoric',
      weather: 'clear',
      gpsLat: 36.1627,
      gpsLng: -86.7816,
      gpsAccuracy: 45.0,
      locationName: 'Nashville, TN, USA',
      userId: user.id,
      categoryId: categories[2].id, // Travel
      isPublic: true,
      shareToken: 'concert-night-' + Date.now(),
      viewCount: 5,
      tags: {
        create: [
          { tagId: tags[1].id }, // favorite
          { tagId: tags[3].id }, // friends
        ],
      },
    }, 14);

    console.log(`✅ Created 15 sample moments`);
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
