import path from "node:path"
import { config as loadEnv } from "dotenv"
import { defineConfig } from "prisma/config"

// Prisma 7 no longer auto-loads .env when a config file is present, so we load
// it ourselves. .env holds DATABASE_URL / DIRECT_URL for the Prisma CLI.
loadEnv()

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    // Non-pooled direct connection used by the Prisma CLI for migrations
    url: process.env.DIRECT_URL,
  },
  migrations: {
    seed: "tsx --env-file=.env prisma/seed.ts",
  },
})
