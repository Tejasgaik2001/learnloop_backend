import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

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
      this.db.knex('revisions')
        .where({
          user_id: userId,
          status: 'pending',
        })
        .whereBetween('due_date', [today, tomorrow])
        .count('* as count')
        .first()
        .then(result => Number(result?.count || 0)),

      // Total topics
      this.db.knex('topics')
        .where({ user_id: userId })
        .count('* as count')
        .first()
        .then(result => Number(result?.count || 0)),

      // Weak topics (strength < 60)
      this.db.knex('topics')
        .where({
          user_id: userId,
        })
        .where('strength_score', '<', 60)
        .count('* as count')
        .first()
        .then(result => Number(result?.count || 0)),

      // Calculate streak (simplified - count consecutive days with completed revisions)
      this.calculateStreak(userId),

      // Weekly completed revisions
      this.db.knex('revisions')
        .where({
          user_id: userId,
          status: 'completed',
        })
        .where('updated_at', '>=', weekAgo)
        .count('* as count')
        .first()
        .then(result => Number(result?.count || 0)),
    ]);

    // Get retention rate (average strength score)
    const avgStrength = await this.db.knex('topics')
      .where({ user_id: userId })
      .avg('strength_score as avg_strength')
      .first();

    return {
      dueToday,
      totalTopics,
      weakTopics,
      streak,
      weeklyRevisions,
      retention: Math.round(Number(avgStrength?.avg_strength) || 0),
      hoursThisWeek: Math.round((weeklyRevisions * 15) / 60 * 10) / 10, // Estimate: 15 min per revision
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    // Get all completed revisions ordered by date
    const revisions = await this.db.knex('revisions')
      .where({
        user_id: userId,
        status: 'completed',
      })
      .orderBy('updated_at', 'desc')
      .select('updated_at');

    if (revisions.length === 0) return 0;

    // Group by date
    const datesWithRevisions = new Set(
      revisions.map((r) => new Date(r.updated_at).toISOString().split('T')[0]),
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
