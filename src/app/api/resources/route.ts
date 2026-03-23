import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resourceSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        project: {
          select: { name: true, id: true },
        },
        entries: {
          select: { title: true, id: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100, // Limit results for faster initial load
    });
    return NextResponse.json(resources);
  } catch (error: any) {
    console.error('API Error:', error);

    // Check for database connection errors
    if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        { error: 'Database is not connected. Please check your POSTGRES_PRISMA_URL.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = resourceSchema.parse(body);

    const { entryId, ...data } = validatedData;

    const resource = await prisma.resource.create({
      data: {
        ...data,
        projectId: data.projectId && data.projectId !== "" ? data.projectId : null,
        entries: entryId && entryId !== "" ? { connect: { id: entryId } } : undefined,
      },
    });
    return NextResponse.json(resource, { status: 201 });
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
