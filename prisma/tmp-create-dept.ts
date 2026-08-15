import 'dotenv/config';
import { PrismaClient } from "../generated/prisma/client";
import { createPgAdapter } from "../lib/pg-adapter";

async function main() {
  const prisma = new PrismaClient({ adapter: createPgAdapter() });
  try {
    const dept = await prisma.department.create({ data: { name: "Test Dept TS" } });
    console.log("Created dept:", dept);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
