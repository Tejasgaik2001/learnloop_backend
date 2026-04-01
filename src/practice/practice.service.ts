import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CreatePracticeDto } from './dto';

@Injectable()
export class PracticeService {
  constructor(private readonly db: DatabaseService) {}

  async create(userId: string, dto: CreatePracticeDto) {
    // Create practice session
    const practice = await this.db.createPracticeSession({
      user_id: userId,
      topic_id: dto.topicId,
      question: dto.question,
      answer: dto.answer,
      result: dto.result,
    });

    // Update strength score if result is good
    if (dto.result === 'correct' || dto.result === 'partial') {
      const strengthChange = dto.result === 'correct' ? 15 : 10;
      
      // Get current strength score
      const topic = await this.db.findTopicById(dto.topicId);
      if (topic) {
        const newStrength = Math.min(100, topic.strength_score + strengthChange);
        await this.db.updateTopicStrength(dto.topicId, newStrength);
      }
    }

    return practice;
  }
}
