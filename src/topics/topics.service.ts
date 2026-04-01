import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTopicDto, UpdateTopicDto } from './dto';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTopicDto) {
    const topic = await this.prisma.topic.create({
      data: {
        userId,
        title: dto.title,
        category: dto.category,
        notes: dto.notes,
        codeSnippet: dto.codeSnippet,
      },
    });

    // Create initial revision schedule
    await this.createInitialRevisions(topic.id, userId);

    return topic;
  }

  async findAll(userId: string) {
    return this.prisma.topic.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return topic;
  }

  async update(id: string, userId: string, dto: UpdateTopicDto) {
    await this.findOne(id, userId);

    return this.prisma.topic.update({
      where: { id },
      data: {
        title: dto.title,
        category: dto.category,
        notes: dto.notes,
        codeSnippet: dto.codeSnippet,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.topic.delete({
      where: { id },
    });
  }

  private async createInitialRevisions(topicId: string, userId: string) {
    const now = new Date();
    const schedule = [1, 3, 7, 15, 30]; // Days from now

    const revisions = schedule.map((days) => ({
      topicId,
      userId,
      dueDate: new Date(now.getTime() + days * 24 * 60 * 60 * 1000),
      status: 'pending',
    }));

    await this.prisma.revision.createMany({
      data: revisions,
    });
  }
}
