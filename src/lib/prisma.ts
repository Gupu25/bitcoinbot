/**
 * 📦 Prisma Client Singleton
 * 
 * Shared Prisma client instance to prevent connection pool exhaustion.
 * Use this instead of creating new PrismaClient() in each module.
 * 
 * In development, hot reloading can create multiple instances,
 * so we store the instance on the global object.
 * 
 * @see https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

// Log connection events in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  
  prisma.$connect().then(() => {
    console.log('✅ Prisma client connected');
  }).catch((err) => {
    console.error('💥 Prisma connection error:', err);
  });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('👋 Prisma client disconnected');
});

export default prisma;
