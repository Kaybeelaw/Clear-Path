import type { PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

function splitSsl(connectionString: string): { url: string; ssl: PoolConfig["ssl"] } {
  const url = new URL(connectionString);
  const sslmode = url.searchParams.get("sslmode");

  if (!sslmode || sslmode === "disable") {
    return { url: connectionString, ssl: undefined };
  }

  url.searchParams.delete("sslmode");
  return { url: url.toString(), ssl: { rejectUnauthorized: false } };
}

export function createPgAdapter(): PrismaPg {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and set a PostgreSQL connection string.",
    );
  }

  const { url, ssl } = splitSsl(connectionString);
  return new PrismaPg({ connectionString: url, ssl });
}
