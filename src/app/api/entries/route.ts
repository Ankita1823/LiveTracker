import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { entrySchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const entries = await prisma.entry.findMany({
      include: {
        project: {
          select: { name: true, id: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 100, // Limit results for faster initial load
    });
    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Check for database connection errors
    if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        { error: 'Database is not connected. Please check your POSTGRES_PRISMA_URL.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = entrySchema.parse(body);

    const entry = await prisma.entry.create({
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        projectId: validatedData.projectId || null,
      },
    });
    return NextResponse.json(entry, { status: 201 });
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
