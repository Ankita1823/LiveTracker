import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resourceSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        project: true,
        entries: true,
      },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error: any) {
    console.error('API Error:', error);

    // Check for database connection errors
    if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        { error: 'Database is not connected. Please check your POSTGRES_PRISMA_URL.' },
        { status: 503 }
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to fetch resource';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = resourceSchema.parse(body);

    const { entryId, ...data } = validatedData;

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...data,
        projectId: data.projectId && data.projectId !== "" ? data.projectId : null,
        entries: entryId && entryId !== "" ? { set: [{ id: entryId }] } : { set: [] },
      },
    });

    return NextResponse.json(resource);
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.resource.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);

    // Check for database connection errors
    if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        { error: 'Database is not connected. Please check your POSTGRES_PRISMA_URL.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
