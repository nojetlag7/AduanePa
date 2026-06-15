import path from "node:path"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    // Non-pooled direct connection used by Prisma CLI for migrations
    url: process.env.DIRECT_URL,
  },
})
