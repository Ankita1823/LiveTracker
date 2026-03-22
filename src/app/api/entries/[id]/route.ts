import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { entrySchema } from '@/lib/validations';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        project: true,
        resources: true,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = entrySchema.parse(body);

    const entry = await prisma.entry.update({
      where: { id },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        projectId: validatedData.projectId || null,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.entry.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
