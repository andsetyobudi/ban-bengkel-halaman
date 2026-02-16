import { PrismaClient } from "./generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function parseDatabaseUrl(url: string): { host: string; port: number; user: string; password: string; database: string } {
  const match = url.match(/^mysql:\/\/([^:]*):?([^@]*)@([^:]+):?(\d*)\/([^?]*)/);
  if (!match) throw new Error("Format DATABASE_URL tidak valid");
  const [, user = "root", password = "", host = "localhost", port = "3306", database = ""] = match;
  return {
    host,
    port: port ? parseInt(port, 10) : 3306,
    user: decodeURIComponent(user),
    password: decodeURIComponent(password),
    database,
  };
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL tidak ada di .env");
  }
  const config = parseDatabaseUrl(url);
  const adapter = new PrismaMariaDb(
    {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: 10,
    },
    { database: config.database }
  );
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
