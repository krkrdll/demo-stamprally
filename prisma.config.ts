import "dotenv/config";
import { defineConfig } from "prisma/config";

const url = process.env["DATABASE_URL"] ?? "file:./dev.db";
const isPostgres = url.startsWith("postgresql") || url.startsWith("postgres");

export default defineConfig({
  schema: isPostgres ? "prisma/schema.postgres.prisma" : "prisma/schema.sqlite.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url,
  },
});
