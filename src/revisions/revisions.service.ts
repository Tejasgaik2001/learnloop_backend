import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CompleteRevisionDto } from './dto';

@Injectable()
export class RevisionsService {
  constructor(private readonly db: DatabaseService) {}

  async getToday(userId: string) {
    return this.db.findTodayRevisions(userId);
  }

  async complete(id: string, userId: string, dto: CompleteRevisionDto) {
    const revision = await this.db.findRevisionById(id);

    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    if (revision.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Calculate next due date based on confidence
    const nextDueDate = this.calculateNextDueDate(dto.confidence);

    // Update strength score
    const strengthChange = this.getStrengthChange(dto.confidence);
    const newStrength = Math.min(100, Math.max(0, revision.strength_score + strengthChange));

    await this.db.transaction(async (trx) => {
      // Update this revision
      await this.db.updateRevision(id, {
        status: 'completed',
        confidence: dto.confidence,
        next_due_date: nextDueDate,
      });

      // Update topic strength score
      await this.db.updateTopicStrength(revision.topic_id, newStrength);

      // Create next revision if confidence wasn't "forgot"
      if (dto.confidence !== 'forgot') {
        await this.db.createRevision({
          topic_id: revision.topic_id,
          user_id: userId,
          due_date: nextDueDate,
          status: 'pending',
        });
      }
    });

    return {
      message: 'Revision completed successfully',
      nextDueDate,
      strengthScore: newStrength,
    };
  }

  private calculateNextDueDate(confidence: string): Date {
    const now = new Date();
    const days = {
      forgot: 1,
      partial: 3,
      strong: 7,
    };
    return new Date(now.getTime() + days[confidence] * 24 * 60 * 60 * 1000);
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
