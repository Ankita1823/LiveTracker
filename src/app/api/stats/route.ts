import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, format, isSameDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [totalEntries, totalProjects, totalResources, allEntriesForStreak, activityEntries, recentProjects, recentEntries, recentResources] = await Promise.all([
      prisma.entry.count(),
      prisma.project.count(),
      prisma.resource.count(),
      // Limit streak calculation to last 100 entries
      prisma.entry.findMany({
        select: { date: true },
        orderBy: { date: 'desc' },
        take: 100,
      }),
      // Activity data (last 8 weeks)
      prisma.entry.findMany({
        where: {
          date: { gte: subDays(new Date(), 56) },
        },
        select: { date: true },
      }),
      // Top tags from recent items to keep it fast
      prisma.project.findMany({ select: { tags: true }, take: 50, orderBy: { createdAt: 'desc' } }),
      prisma.entry.findMany({ select: { tags: true }, take: 50, orderBy: { createdAt: 'desc' } }),
      prisma.resource.findMany({ select: { tags: true }, take: 50, orderBy: { createdAt: 'desc' } }),
    ]);

    // Calculate streak
    let streak = 0;
    if (allEntriesForStreak.length > 0) {
      let currentDate = startOfDay(new Date());
      let entryIdx = 0;

      // Check if last entry was today or yesterday
      const lastEntryDate = startOfDay(new Date(allEntriesForStreak[0].date));
      if (isSameDay(lastEntryDate, currentDate) || isSameDay(lastEntryDate, subDays(currentDate, 1))) {
        // Start from the most recent entry day
        currentDate = lastEntryDate;
        streak = 1;
        entryIdx = 1;

        while (entryIdx < allEntriesForStreak.length) {
          const entryDate = startOfDay(new Date(allEntriesForStreak[entryIdx].date));
          const prevDay = subDays(currentDate, 1);

          if (isSameDay(entryDate, currentDate)) {
            // Multiple entries on the same day, ignore
            entryIdx++;
            continue;
          }

          if (isSameDay(entryDate, prevDay)) {
            streak++;
            currentDate = prevDay;
            entryIdx++;
          } else {
            break;
          }
        }
      }
    }

    const activityMap = new Map();
    for (let i = 0; i < 56; i++) {
      const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
      activityMap.set(dateStr, 0);
    }

    activityEntries.forEach((entry) => {
      const dateStr = format(new Date(entry.date), 'yyyy-MM-dd');
      if (activityMap.has(dateStr)) {
        activityMap.set(dateStr, activityMap.get(dateStr) + 1);
      }
    });

    const activityData = Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .reverse();

    // Top tags from recent items
    const tagCounts: Record<string, number> = {};
    [...recentProjects, ...recentEntries, ...recentResources].forEach((item) => {
      if (item.tags) {
        item.tags.split(',').forEach((tag) => {
          const trimmed = tag.trim().toLowerCase();
          if (trimmed) {
            tagCounts[trimmed] = (tagCounts[trimmed] || 0) + 1;
          }
        });
      }
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      totalEntries,
      totalProjects,
      totalResources,
      streak,
      activityData,
      topTags,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Check for database connection errors
    if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        { error: 'Database is not connected. Please check your POSTGRES_PRISMA_URL.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
