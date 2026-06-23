import "dotenv/config";
import { defineConfig } from "prisma/config";

const url = process.env["DATABASE_URL"] ?? "file:./dev.db";
const isPostgres = url.startsWith("postgresql") || url.startsWith("postgres");

// db push などのスキーマ操作は Session pooler (DIRECT_URL) を使う
// Transaction pooler (DATABASE_URL) は DDL に非対応
const schemaUrl = isPostgres
  ? (process.env["DIRECT_URL"] ?? url)
  : url;

export default defineConfig({
  schema: isPostgres ? "prisma/schema.postgres.prisma" : "prisma/schema.sqlite.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: schemaUrl,
  },
});
