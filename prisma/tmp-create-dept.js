const { PrismaClient } = require('../generated/prisma/client');
const { createPgAdapter } = require('../lib/pg-adapter');

(async function(){
  const prisma = new PrismaClient({ adapter: createPgAdapter() });
  try{
    const dept = await prisma.department.create({ data: { name: 'Test Dept 3' } });
    console.log('Created dept:', dept);
  }catch(e){
    console.error('Error creating dept:', e);
    process.exit(1);
  }finally{
    await prisma.$disconnect();
  }
})();
