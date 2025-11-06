const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function testGallery() {
  try {
    console.log('Testing gallery query...\n');

    // Count all moments
    const totalCount = await prisma.moment.count();
    console.log('Total moments:', totalCount);

    // Count moments with media
    const withImage = await prisma.moment.count({
      where: { imageUrl: { not: null } }
    });
    console.log('Moments with images:', withImage);

    const withAudio = await prisma.moment.count({
      where: { audioUrl: { not: null } }
    });
    console.log('Moments with audio:', withAudio);

    const withVideo = await prisma.moment.count({
      where: { videoUrl: { not: null } }
    });
    console.log('Moments with video:', withVideo);

    // Count with ANY media (the gallery query)
    const withMedia = await prisma.moment.count({
      where: {
        OR: [
          { imageUrl: { not: null } },
          { audioUrl: { not: null } },
          { videoUrl: { not: null } },
        ],
      },
    });
    console.log('Moments with ANY media:', withMedia);

    // Get a few sample moments
    console.log('\nSample moments:');
    const samples = await prisma.moment.findMany({
      take: 3,
      select: {
        id: true,
        description: true,
        imageUrl: true,
        audioUrl: true,
        videoUrl: true,
      }
    });
    console.log(JSON.stringify(samples, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGallery();
