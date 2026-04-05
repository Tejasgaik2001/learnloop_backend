import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { SubmitPracticeDto, PracticeResultDto, QuestionDto } from './dto';

interface QuestionWithWeight {
  id: string;
  topic_id: string;
  type: string;
  question: string;
  options: any;
  correct_answer: string;
  difficulty: number;
  weight: number;
  last_asked_at: Date | null;
  retention_score: number;
  topic_title: string;
  category: string;
}

@Injectable()
export class PracticeService {
  constructor(private readonly db: DatabaseService) {}

  async getRandomQuestions(userId: string, limit: number = 10): Promise<QuestionDto[]> {
    const questions = await this.db.findAllQuestionsForUser(userId);
    if (questions.length === 0) return [];

    const weightedQuestions = questions.map(q => ({
      ...q,
      calculatedWeight: this.calculateWeight(q),
    }));

    const shuffled = this.weightedShuffle(weightedQuestions);
    const selected = shuffled.slice(0, limit);

    for (const q of selected) {
      await this.db.updateQuestionLastAsked(q.id);
    }

    return selected.map(q => this.mapToQuestionDto(q));
  }

  async getWeakQuestions(userId: string, limit: number = 10): Promise<QuestionDto[]> {
    const questions = await this.db.findWeakTopicQuestions(userId, limit * 2);
    if (questions.length === 0) {
      return this.getRandomQuestions(userId, limit);
    }

    const weighted = questions.map(q => ({
      ...q,
      calculatedWeight: this.calculateWeight(q, true),
    }));

    const shuffled = this.weightedShuffle(weighted);
    const selected = shuffled.slice(0, limit);

    for (const q of selected) {
      await this.db.updateQuestionLastAsked(q.id);
    }

    return selected.map(q => this.mapToQuestionDto(q));
  }

  async getTopicQuestions(topicId: string, limit: number = 10): Promise<QuestionDto[]> {
    const topic = await this.db.findTopicById(topicId);
    if (!topic) throw new NotFoundException('Topic not found');

    const questions = await this.db.findQuestionsByTopic(topicId, limit);
    for (const q of questions) {
      await this.db.updateQuestionLastAsked(q.id);
    }

    return questions.map(q => this.mapToQuestionDto(q));
  }

  async getMixedPractice(userId: string, limit: number = 10): Promise<QuestionDto[]> {
    const dueCount = Math.ceil(limit * 0.7);
    const randomCount = limit - dueCount;

    const dueRevisions = await this.db.findTodayRevisions(userId);
    const dueQuestions: QuestionWithWeight[] = dueRevisions.map(r => ({
      id: r.id,
      topic_id: r.topic_id,
      type: 'revision_card',
      question: r.title,
      options: null,
      correct_answer: r.notes || '',
      difficulty: 3,
      weight: 10,
      last_asked_at: null,
      retention_score: r.strength_score || 50,
      topic_title: r.title,
      category: r.category,
    }));

    const randomQuestions = await this.db.findRandomQuestions(userId, randomCount);
    const randomWithWeight: QuestionWithWeight[] = randomQuestions.map(q => ({
      ...q,
      calculatedWeight: this.calculateWeight(q),
    }));

    const combined = [...dueQuestions, ...randomWithWeight];
    const shuffled = this.weightedShuffle(combined);
    const selected = shuffled.slice(0, limit);

    for (const q of selected) {
      if (q.type !== 'revision_card') {
        await this.db.updateQuestionLastAsked(q.id);
      }
    }

    return selected.map(q => this.mapToQuestionDto(q));
  }

  async submitPractice(userId: string, dto: SubmitPracticeDto): Promise<PracticeResultDto> {
    const { answers } = dto;
    const totalQuestions = answers.length;
    
    if (totalQuestions === 0) {
      return { score: 0, totalQuestions: 0, correctCount: 0, incorrectCount: 0, percentage: 0, weakAreas: [] };
    }

    const session = await this.db.createPracticeSessionFull({
      user_id: userId,
      score: 0,
      total_questions: totalQuestions,
      correct_count: 0,
      incorrect_count: 0,
      percentage: 0,
      weak_areas: [],
    });

    let correctCount = 0;
    let totalScore = 0;
    const weakAreas: string[] = [];
    const topicStats: Map<string, { correct: number; total: number; topicTitle: string }> = new Map();

    for (const answer of answers) {
      const question = await this.db.findQuestionById(answer.questionId);
      if (!question) continue;

      const isCorrect = this.checkAnswer(question, answer.selectedAnswer);
      const points = isCorrect ? 10 * question.difficulty : 0;
      totalScore += points;
      if (isCorrect) correctCount++;

      const topicId = question.topic_id;
      const existing = topicStats.get(topicId) || { correct: 0, total: 0, topicTitle: '' };
      existing.correct += isCorrect ? 1 : 0;
      existing.total += 1;
      existing.topicTitle = question.topic_title || '';
      topicStats.set(topicId, existing);

      await this.db.createPracticeAttempt({
        session_id: session.id,
        question_id: answer.questionId,
        selected_answer: answer.selectedAnswer,
        is_correct: isCorrect,
        time_taken: answer.timeTaken,
      });

      await this.updateTopicScore(topicId, isCorrect);
    }

    topicStats.forEach((stats, topicId) => {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy < 50 && !weakAreas.includes(stats.topicTitle)) {
        weakAreas.push(stats.topicTitle);
      }
    });

    const incorrectCount = totalQuestions - correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    return { score: totalScore, totalQuestions, correctCount, incorrectCount, percentage, weakAreas };
  }

  private calculateWeight(question: any, isWeakTopic: boolean = false): number {
    let weight = question.weight || 1;

    if (question.retention_score < 50) weight *= 5;
    else if (question.retention_score < 70) weight *= 2;

    if (isWeakTopic || question.retention_score < 60) weight *= 3;

    if (question.last_asked_at) {
      const hoursSinceAsked = (Date.now() - new Date(question.last_asked_at).getTime()) / (1000 * 60 * 60);
      if (hoursSinceAsked < 1) weight *= 0.1;
      else if (hoursSinceAsked < 24) weight *= 0.5;
    } else {
      weight *= 1.5;
    }

    const difficulty = question.difficulty || 3;
    if (difficulty === 3) weight *= 1.2;

    return weight;
  }

  private weightedShuffle(questions: any[]): any[] {
    const pool: any[] = [];
    for (const q of questions) {
      const count = Math.ceil(q.calculatedWeight || 1);
      for (let i = 0; i < count; i++) pool.push(q);
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const seen = new Set();
    const result: any[] = [];
    for (const q of pool) {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        result.push(q);
      }
    }

    return result;
  }

  private checkAnswer(question: any, selectedAnswer: string): boolean {
    const correct = question.correct_answer?.toLowerCase().trim();
    const selected = selectedAnswer?.toLowerCase().trim();

    if (question.type === 'mcq') return correct === selected;
    if (question.type === 'short_answer') {
      return selected.includes(correct) || correct.includes(selected) || this.calculateSimilarity(correct, selected) > 0.8;
    }
    return correct === selected;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.split(' '));
    const set2 = new Set(str2.split(' '));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  private async updateTopicScore(topicId: string, isCorrect: boolean): Promise<void> {
    const topic = await this.db.findTopicById(topicId);
    if (!topic) return;
    const currentScore = topic.retention_score || 50;
    const change = isCorrect ? 5 : -10;
    const newScore = Math.max(0, Math.min(100, currentScore + change));
    await this.db.updateTopicRetentionScore(topicId, newScore);
  }

  private mapToQuestionDto(q: any): QuestionDto {
    return {
      id: q.id,
      topicId: q.topic_id,
      type: q.type,
      question: q.question,
      options: q.options || [],
      difficulty: q.difficulty,
      topicTitle: q.topic_title || '',
    };
  }

  async createQuestion(questionData: {
    topic_id: string;
    type: string;
    question: string;
    options?: any;
    correct_answer: string;
    difficulty: number;
    weight: number;
  }) {
    return this.db.createQuestion(questionData);
  }

  async create(userId: string, dto: any) {
    return this.db.createPracticeSession({
      user_id: userId,
      topic_id: dto.topicId,
      question: dto.question,
      answer: dto.answer,
      result: dto.result,
    });
  }
}
