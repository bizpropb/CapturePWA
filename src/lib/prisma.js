import { PrismaClient } from '@/generated/prisma';

/**
 * Prisma Client singleton
 * Prevents multiple instances during development hot-reload
 */

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
