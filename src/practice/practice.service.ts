import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePracticeDto } from './dto';

@Injectable()
export class PracticeService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePracticeDto) {
    // Create practice session
    const practice = await this.prisma.practiceSession.create({
      data: {
        userId,
        topicId: dto.topicId,
        question: dto.question,
        answer: dto.answer,
        result: dto.result,
      },
    });

    // Update strength score if result is good
    if (dto.result === 'correct' || dto.result === 'partial') {
      const strengthChange = dto.result === 'correct' ? 15 : 10;
      
      await this.prisma.topic.update({
        where: { id: dto.topicId },
        data: {
          strengthScore: {
            increment: strengthChange,
          },
        },
      });
    }

    return practice;
  }
}
