import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a singleton PrismaClient instance
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Prevent multiple instances in development mode
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Helper function to handle Prisma errors gracefully
export async function handlePrismaOperation<T>(
  operation: () => Promise<T>,
  errorMessage = 'Database operation failed'
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    console.error(`Prisma Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { data: null, error: errorMessage };
  }
} 