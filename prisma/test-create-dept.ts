import { PrismaClient } from '../generated/prisma/client';
import { createPgAdapter } from '../lib/pg-adapter';

async function main() {
  const prisma = new PrismaClient({ adapter: createPgAdapter() });
  const dept = await prisma.department.create({ data: { name: 'Test Dept' } });
  console.log('Created dept', dept);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
