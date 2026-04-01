import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get counts in parallel
    const [
      dueToday,
      totalTopics,
      weakTopics,
      streak,
      weeklyRevisions,
    ] = await Promise.all([
      // Count revisions due today
      this.prisma.revision.count({
        where: {
          userId,
          status: 'pending',
          dueDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Total topics
      this.prisma.topic.count({
        where: { userId },
      }),

      // Weak topics (strength < 60)
      this.prisma.topic.count({
        where: {
          userId,
          strengthScore: {
            lt: 60,
          },
        },
      }),

      // Calculate streak (simplified - count consecutive days with completed revisions)
      this.calculateStreak(userId),

      // Weekly completed revisions
      this.prisma.revision.count({
        where: {
          userId,
          status: 'completed',
          updatedAt: {
            gte: weekAgo,
          },
        },
      }),
    ]);

    // Get retention rate (average strength score)
    const avgStrength = await this.prisma.topic.aggregate({
      where: { userId },
      _avg: {
        strengthScore: true,
      },
    });

    return {
      dueToday,
      totalTopics,
      weakTopics,
      streak,
      weeklyRevisions,
      retention: Math.round(avgStrength._avg.strengthScore || 0),
      hoursThisWeek: Math.round((weeklyRevisions * 15) / 60 * 10) / 10, // Estimate: 15 min per revision
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    // Get all completed revisions ordered by date
    const revisions = await this.prisma.revision.findMany({
      where: {
        userId,
        status: 'completed',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        updatedAt: true,
      },
    });

    if (revisions.length === 0) return 0;

    // Group by date
    const datesWithRevisions = new Set(
      revisions.map((r) => r.updatedAt.toISOString().split('T')[0]),
    );

    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = new Date(today);

    // Check today first
    const todayStr = currentDate.toISOString().split('T')[0];
    if (datesWithRevisions.has(todayStr)) {
      streak++;
    }

    // Go backwards
    currentDate.setDate(currentDate.getDate() - 1);
    while (datesWithRevisions.has(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }
}
