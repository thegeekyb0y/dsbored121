import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createClient() {
  // Pooled connection for application traffic (sslmode=require comes from the
  // Neon URL). max: 1 keeps each serverless instance to a single connection so a
  // burst of functions cannot exhaust the Neon connection limit; the globalThis
  // singleton below reuses one client per instance in dev.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  return new PrismaClient({
    adapter,
    log: ["query"],
  });
}

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
