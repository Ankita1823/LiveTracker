import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validations';

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
  } catch (error) {
    console.error('API Error:', error);
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
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
