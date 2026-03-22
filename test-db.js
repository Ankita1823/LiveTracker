const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const projects = await prisma.project.findMany();
    console.log('Projects count:', projects.length);
    if (projects.length > 0) {
      console.log('First project:', projects[0].name);
    }
    const entries = await prisma.entry.findMany();
    console.log('Entries count:', entries.length);
    const resources = await prisma.resource.findMany();
    console.log('Resources count:', resources.length);
    console.log('Database check: SUCCESS');
  } catch (e) {
    console.error('Database check: FAILED', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
