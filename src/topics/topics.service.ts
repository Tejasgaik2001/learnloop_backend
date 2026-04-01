import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CreateTopicDto, UpdateTopicDto } from './dto';

@Injectable()
export class TopicsService {
  constructor(private db: DatabaseService) {}

  async create(userId: string, dto: CreateTopicDto) {
    const topic = await this.db.createTopic({
      user_id: userId,
      title: dto.title,
      category: dto.category,
      notes: dto.notes,
      code_snippet: dto.codeSnippet,
    });

    // Create initial revision schedule
    await this.createInitialRevisions(topic.id, userId);

    return topic;
  }

  async findAll(userId: string) {
    return this.db.findTopicsByUserId(userId);
  }

  async findOne(id: string, userId: string) {
    const topic = await this.db.findTopicById(id);

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return topic;
  }

  async update(id: string, userId: string, dto: UpdateTopicDto) {
    await this.findOne(id, userId);

    return this.db.updateTopic(id, {
      title: dto.title,
      category: dto.category,
      notes: dto.notes,
      code_snippet: dto.codeSnippet,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.db.deleteTopic(id);
  }

  private async createInitialRevisions(topicId: string, userId: string) {
    const now = new Date();
    const schedule = [1, 3, 7, 15, 30]; // Days from now

    const revisions = schedule.map((days) => ({
      topic_id: topicId,
      user_id: userId,
      due_date: new Date(now.getTime() + days * 24 * 60 * 60 * 1000),
      status: 'pending',
    }));

    await this.db.createRevisions(revisions);
  }
}
