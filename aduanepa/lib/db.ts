import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url
  // pg v8 warns when sslmode=require is used; verify-full keeps current Neon behavior.
  return url.replace(/([?&])sslmode=require\b/g, "$1sslmode=verify-full")
}

// Prisma 7 connects through a driver adapter rather than a built-in engine URL.
// The pooled DATABASE_URL is used for all runtime queries.
const adapter = new PrismaPg({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
