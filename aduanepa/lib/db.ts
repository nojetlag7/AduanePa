import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // In Prisma v7, the datasource URL is passed here instead of schema.prisma
    datasourceUrl: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
