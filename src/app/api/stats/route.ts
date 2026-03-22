import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, format, isSameDay } from 'date-fns';

export async function GET() {
  try {
    const [totalEntries, totalProjects, totalResources] = await Promise.all([
      prisma.entry.count(),
      prisma.project.count(),
      prisma.resource.count(),
    ]);

    // Calculate streak
    const allEntries = await prisma.entry.findMany({
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    let streak = 0;
    if (allEntries.length > 0) {
      let currentDate = startOfDay(new Date());
      let entryIdx = 0;

      // Check if last entry was today or yesterday
      const lastEntryDate = startOfDay(new Date(allEntries[0].date));
      if (isSameDay(lastEntryDate, currentDate) || isSameDay(lastEntryDate, subDays(currentDate, 1))) {
        // Start from the most recent entry day
        currentDate = lastEntryDate;
        streak = 1;
        entryIdx = 1;

        while (entryIdx < allEntries.length) {
          const entryDate = startOfDay(new Date(allEntries[entryIdx].date));
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

    // Activity data (last 8 weeks)
    const eightWeeksAgo = subDays(new Date(), 56);
    const activityEntries = await prisma.entry.findMany({
      where: {
        date: { gte: eightWeeksAgo },
      },
      select: { date: true },
    });

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

    // Top tags
    const projects = await prisma.project.findMany({ select: { tags: true } });
    const entries = await prisma.entry.findMany({ select: { tags: true } });
    const resources = await prisma.resource.findMany({ select: { tags: true } });

    const tagCounts: Record<string, number> = {};
    [...projects, ...entries, ...resources].forEach((item) => {
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
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
