import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CompleteRevisionDto } from './dto';

@Injectable()
export class RevisionsService {
  constructor(private prisma: PrismaService) {}

  async getToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.revision.findMany({
      where: {
        userId,
        status: 'pending',
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        topic: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async complete(id: string, userId: string, dto: CompleteRevisionDto) {
    const revision = await this.prisma.revision.findUnique({
      where: { id },
      include: { topic: true },
    });

    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    if (revision.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Calculate next due date based on confidence
    const nextDueDate = this.calculateNextDueDate(dto.confidence);

    // Update strength score
    const strengthChange = this.getStrengthChange(dto.confidence);
    const newStrength = Math.min(100, Math.max(0, revision.topic.strengthScore + strengthChange));

    await this.prisma.$transaction([
      // Update this revision
      this.prisma.revision.update({
        where: { id },
        data: {
          status: 'completed',
          confidence: dto.confidence,
          nextDueDate,
        },
      }),
      // Update topic strength score
      this.prisma.topic.update({
        where: { id: revision.topicId },
        data: {
          strengthScore: newStrength,
        },
      }),
      // Create next revision if confidence wasn't "forgot"
      ...(dto.confidence !== 'forgot' ? [
        this.prisma.revision.create({
          data: {
            topicId: revision.topicId,
            userId,
            dueDate: nextDueDate,
            status: 'pending',
          },
        }),
      ] : []),
    ]);

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
