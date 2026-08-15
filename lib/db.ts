import { PrismaClient } from "@/generated/prisma/client";
import { createPgAdapter } from "./pg-adapter";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  return new PrismaClient({ adapter: createPgAdapter() });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
