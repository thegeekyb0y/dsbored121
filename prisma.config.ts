import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // CLI and migrations connect directly; the app uses the pooled URL through
  // the pg driver adapter in app/lib/prisma.ts.
  datasource: {
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
