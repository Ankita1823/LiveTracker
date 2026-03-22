const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  await prisma.resource.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.project.deleteMany();

  console.log('Seeding projects...');
  const project1 = await prisma.project.create({
    data: {
      name: 'DevLog Portfolio',
      description: 'A fullstack learning journal built with Next.js 15 and Prisma.',
      techStack: 'Next.js, TypeScript, Tailwind, Prisma',
      tags: 'Fullstack, Portfolio, React',
      status: 'Building',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Weather Explorer',
      description: 'A React Native app to explore global weather patterns.',
      techStack: 'React Native, Expo, OpenWeather API',
      tags: 'Mobile, API, JavaScript',
      status: 'Shipped',
    },
  });

  console.log('Seeding entries...');
  const now = new Date();
  await prisma.entry.create({
    data: {
      title: 'Setting up Prisma with SQLite',
      date: new Date(now.getTime() - 86400000), // yesterday
      notes: 'Today I learned how to set up Prisma with SQLite in a Next.js 15 App Router environment. The process is straightforward but requires some care with the `params` being a promise in Next.js 15.',
      tags: 'Prisma, SQLite, Next.js',
      projectId: project1.id,
    },
  });

  await prisma.entry.create({
    data: {
      title: 'UI Design with Tailwind',
      date: now,
      notes: 'Implemented the main dashboard UI. Used Recharts for the activity graph. Tailwind CSS makes it easy to build responsive, modern interfaces quickly.',
      tags: 'Tailwind, UI/UX, Recharts',
      projectId: project1.id,
    },
  });

  console.log('Seeding resources...');
  await prisma.resource.create({
    data: {
      title: 'Prisma Documentation',
      url: 'https://www.prisma.io/docs',
      category: 'Documentation',
      notes: 'Excellent documentation for all things Prisma.',
      tags: 'Prisma, Backend, DB',
      isFavorite: true,
      projectId: project1.id,
    },
  });

  await prisma.resource.create({
    data: {
      title: 'Tailwind UI Components',
      url: 'https://tailwindui.com',
      category: 'Design',
      notes: 'Great inspiration for clean UI components.',
      tags: 'CSS, Tailwind, Design',
      isRead: true,
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
