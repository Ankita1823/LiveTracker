import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { entries: true, resources: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('API Error:', error);

    // Check for database connection errors
    if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        { error: 'Database is not connected. Please check your POSTGRES_PRISMA_URL.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = projectSchema.parse(body);

    const project = await prisma.project.create({
      data: validatedData,
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);

    // Check for database connection errors
    if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        { error: 'Database is not connected. Please check your POSTGRES_PRISMA_URL.' },
        { status: 503 }
      );
    }

    const message = error instanceof Error ? error.message : 'Invalid data';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
