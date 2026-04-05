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

  async getWeakTopics(userId: string) {
    return this.db.findWeakTopics(userId, 5);
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
      });

      // Update topic strength score
      await this.db.updateTopicStrength(revision.topic_id, newStrength);
    });

    return {
      message: 'Revision completed successfully',
      revisionDay: revision.revision_day,
      strengthScore: newStrength,
    };
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
