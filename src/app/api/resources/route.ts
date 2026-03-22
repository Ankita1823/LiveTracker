import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resourceSchema } from '@/lib/validations';

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
    });
    return NextResponse.json(resources);
  } catch (error) {
    console.error('API Error:', error);
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
        projectId: data.projectId || null,
        entries: entryId ? { connect: { id: entryId } } : undefined,
      },
    });
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
