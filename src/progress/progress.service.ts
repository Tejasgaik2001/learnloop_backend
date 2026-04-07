import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

@Injectable()
export class ProgressService {
  constructor(private readonly db: DatabaseService) {}

  async getSummary(userId: string, period?: 'week' | 'month' | 'all') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }

    // Get metrics in parallel
    const [
      totalTopics,
      totalRevisions,
      completedRevisions,
      practiceSessions,
      weakTopics,
      avgStrength,
      weeklyRevisions
    ] = await Promise.all([
      // Total topics
      this.db.knex('topics')
        .where({ user_id: userId })
        .count('* as count')
        .first()
        .then(result => Number(result?.count || 0)),

      // Total revisions
      this.db.knex('revisions')
        .where({ user_id: userId })
        .count('* as count')
        .first()
        .then(result => Number(result?.count || 0)),

      // Completed revisions
      this.db.knex('revisions')
        .where({
          user_id: userId,
          status: 'completed'
        })
        .where('updated_at', '>=', startDate)
        .count('* as count')
        .first()
        .then(result => Number(result?.count || 0)),

      // Practice sessions
      this.db.knex('practice_sessions')
        .where({ user_id: userId })
        .where('completed_at', '>=', startDate)
        .count('* as count')
        .first()
        .then(result => Number(result?.count || 0)),

      // Weak topics (strength < 60)
      this.db.knex('topics')
        .where({
          user_id: userId
        })
        .where('strength_score', '<', 60)
        .count('* as count')
        .first()
        .then(result => Number(result?.count || 0)),

      // Average strength
      this.db.knex('topics')
        .where({ user_id: userId })
        .avg('strength_score as avg_strength')
        .first()
        .then(result => Math.round(Number(result?.avg_strength) || 0)),

      // Weekly revisions (last 7 days)
      this.db.knex('revisions')
        .where({
          user_id: userId,
          status: 'completed'
        })
        .where('updated_at', '>=', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
        .count('* as count')
        .first()
        .then(result => Number(result?.count || 0))
    ]);

    // Calculate streak
    const streak = await this.calculateStreak(userId);

    // Get weak topics details
    const weakTopicsDetails = await this.db.knex('topics')
      .where({
        user_id: userId
      })
      .where('strength_score', '<', 60)
      .select('id', 'title', 'category', 'strength_score')
      .orderBy('strength_score', 'asc')
      .limit(5);

    return {
      summary: {
        totalTopics,
        totalRevisions,
        completedRevisions,
        practiceSessions,
        weakTopics,
        avgStrength,
        streak,
        weeklyRevisions,
        hoursThisWeek: Math.round((weeklyRevisions * 15) / 60 * 10) / 10, // Estimate: 15 min per revision
        retentionRate: totalRevisions > 0 ? Math.round((completedRevisions / totalRevisions) * 100) : 0
      },
      weakTopics: weakTopicsDetails,
      period: period || 'all'
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    // Get all completed revisions ordered by date
    const revisions = await this.db.knex('revisions')
      .where({
        user_id: userId,
        status: 'completed'
      })
      .orderBy('updated_at', 'desc')
      .select('updated_at')
      .limit(100); // Limit to last 100 for performance

    if (revisions.length === 0) return 0;

    // Group by date
    const datesWithRevisions = new Set(
      revisions.map((r) => new Date(r.updated_at).toISOString().split('T')[0])
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
    } else {
      // If no revision today, check yesterday
      currentDate.setDate(currentDate.getDate() - 1);
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
