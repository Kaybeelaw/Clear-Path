import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { createPgAdapter } from '../lib/pg-adapter';

async function main(){
  const prisma = new PrismaClient({ adapter: createPgAdapter() });
  try{
    console.log('Making legacy department columns nullable...');
    await prisma.$executeRawUnsafe('ALTER TABLE "Student" ALTER COLUMN "department" DROP NOT NULL');
    await prisma.$executeRawUnsafe('ALTER TABLE "Officer" ALTER COLUMN "department" DROP NOT NULL');
    console.log('Done');
  }catch(e){
    console.error(e);
    process.exit(1);
  }finally{
    await prisma.$disconnect();
  }
}

main();
