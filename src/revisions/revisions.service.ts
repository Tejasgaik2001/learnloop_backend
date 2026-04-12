import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CompleteRevisionDto } from './dto';

@Injectable()
export class RevisionsService {
  constructor(private readonly db: DatabaseService) {}

  async getAll(userId: string) {
    return this.db.findAllRevisions(userId);
  }

  async getToday(userId: string) {
    return this.db.findTodayRevisions(userId);
  }

  async getPending(userId: string) {
    return this.db.findPendingRevisions(userId);
  }

  async getUpcoming(userId: string) {
    return this.db.findUpcomingRevisions(userId);
  }

  async getCompleted(userId: string) {
    return this.db.findCompletedRevisions(userId);
  }

  async getWeakTopics(userId: string) {
    return this.db.findWeakTopics(userId, 5);
  }

  async getDetails(id: string, userId: string) {
    const revision = await this.db.findRevisionById(id);
    
    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    if (revision.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Get revision history
    const history = await this.db.findRevisionHistory(id);

    // Get topic details
    const topic = await this.db.findTopicById(revision.topic_id);

    return {
      ...revision,
      topic,
      history,
    };
  }

  async complete(id: string, userId: string, dto: CompleteRevisionDto) {
    const revision = await this.db.findRevisionById(id);

    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    if (revision.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Update strength score
    const strengthChange = this.getStrengthChange(dto.confidence);
    const newStrength = Math.min(100, Math.max(0, revision.strength_score + strengthChange));

    await this.db.transaction(async (trx) => {
      // Update this revision
      await this.db.updateRevision(id, {
        status: 'completed',
        confidence: dto.confidence,
        completed_at: new Date(),
      });

      // Log revision history
      await this.db.createRevisionHistory({
        revision_id: id,
        user_id: userId,
        revision_day: revision.revision_day,
        scheduled_date: revision.due_date,
        completed_date: new Date(),
        status: 'completed',
        confidence: dto.confidence,
      });

      // Update topic strength score
      await this.db.updateTopicStrength(revision.topic_id, newStrength);

      // Create next revision if not the last one
      const pattern = revision.revision_pattern || '1-4-7-15-30';
      const days = pattern.split('-').map(Number);
      const currentIndex = days.indexOf(revision.revision_day);
      
      if (currentIndex < days.length - 1) {
        const nextDay = days[currentIndex + 1];
        const nextDueDate = this.calculateNextDueDate(revision.schedule_type, revision.due_date, nextDay);
        
        await this.db.createRevision({
          topic_id: revision.topic_id,
          user_id: userId,
          due_date: nextDueDate,
          revision_day: nextDay,
          status: 'pending',
          revision_pattern: pattern,
          schedule_type: revision.schedule_type || 'fixed',
          strength_score: newStrength,
        });
      }
    });

    return {
      message: 'Revision completed successfully',
      revisionDay: revision.revision_day,
      strengthScore: newStrength,
    };
  }

  async checkMissedRevisions(userId: string) {
    const pendingRevisions = await this.db.findPendingRevisions(userId);
    const now = new Date();

    for (const revision of pendingRevisions) {
      if (new Date(revision.due_date) < now) {
        await this.db.transaction(async (trx) => {
          // Update revision status to pending_revision
          await this.db.updateRevision(revision.id, {
            status: 'pending_revision',
            missed_count: (revision.missed_count || 0) + 1,
          });

          // Log as missed in history
          await this.db.createRevisionHistory({
            revision_id: revision.id,
            user_id: userId,
            revision_day: revision.revision_day,
            scheduled_date: revision.due_date,
            status: 'missed',
          });
        });
      }
    }

    return {
      message: 'Missed revisions checked and updated',
      count: pendingRevisions.length,
    };
  }

  private calculateNextDueDate(scheduleType: string, baseDate: Date, daysToAdd: number): Date {
    const base = new Date(baseDate);
    
    if (scheduleType === 'fixed') {
      // Fixed schedule: calculate from original topic creation date
      const result = new Date(base);
      result.setDate(result.getDate() + daysToAdd);
      return result;
    } else {
      // Shifted schedule: calculate from completion date
      const result = new Date();
      result.setDate(result.getDate() + daysToAdd);
      return result;
    }
  }

  private getStrengthChange(confidence: string): number {
    const changes = {
      forgot: -5,
      partial: 10,
      strong: 10,
    };
    return changes[confidence];
  }
}
