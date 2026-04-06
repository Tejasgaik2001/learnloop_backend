import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import type { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';

export interface Question {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  category: string | null;
  difficulty: string;
  topic: string | null;
  tags: string[];
  times_asked: number;
  times_correct: number;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class QuestionsService {
  constructor(private readonly db: DatabaseService) {}

  async create(userId: string, dto: CreateQuestionDto): Promise<Question> {
    const [question] = await this.db.createQuestion({
      user_id: userId,
      question: dto.question,
      answer: dto.answer,
      category: dto.category || null,
      difficulty: dto.difficulty || 'medium',
      topic: dto.topic || null,
      tags: dto.tags || [],
    });
    return question;
  }

  async findAll(userId: string, filters?: { category?: string; difficulty?: string }): Promise<Question[]> {
    return this.db.findQuestionsByUser(userId, filters);
  }

  async findOne(userId: string, id: string): Promise<Question> {
    const question = await this.db.findQuestionById(id);
    if (!question || question.user_id !== userId) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async update(userId: string, id: string, dto: UpdateQuestionDto): Promise<Question> {
    // Verify ownership
    await this.findOne(userId, id);
    
    const [updated] = await this.db.updateQuestion(id, {
      question: dto.question,
      answer: dto.answer,
      category: dto.category,
      difficulty: dto.difficulty,
      topic: dto.topic,
      tags: dto.tags,
    });
    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    // Verify ownership
    await this.findOne(userId, id);
    await this.db.deleteQuestion(id);
  }

  async getRandomQuestions(
    userId: string, 
    options: { count?: number; category?: string; difficulty?: string }
  ): Promise<Question[]> {
    const count = options.count || 10;
    return this.db.getRandomQuestions(userId, {
      count,
      category: options.category,
      difficulty: options.difficulty,
    });
  }

  async recordAttempt(userId: string, questionId: string, isCorrect: boolean): Promise<void> {
    await this.db.recordQuestionAttempt(questionId, isCorrect);
  }

  async getCategories(userId: string): Promise<string[]> {
    return this.db.getQuestionCategories(userId);
  }
}
