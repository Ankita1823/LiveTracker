import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { entrySchema } from '@/lib/validations';

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
  } catch (error) {
    console.error('API Error:', error);
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
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
