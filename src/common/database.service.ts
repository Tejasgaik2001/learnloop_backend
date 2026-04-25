import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import knex, { Knex } from 'knex';
import { ClockService } from './clock.service';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Knex;

  constructor(private readonly clock: ClockService) {}

  async onModuleInit() {
    this.db = knex({
      client: 'postgresql',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: Number.parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'learnloop_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '1234',
      },
    });
    await this.db.raw('SELECT 1');
  }

  async onModuleDestroy() {
    await this.db.destroy();
  }

  get knex(): Knex {
    return this.db;
  }

  // Users
  async createUser(userData: {
    name: string;
    email: string;
    password_hash?: string;
    google_id?: string;
    auth_provider?: string;
    avatar_url?: string;
  }) {
    const [user] = await this.db('users').insert({...userData, created_at: this.clock.now()}).returning('*');
    return user;
  }

  async findUserByGoogleId(googleId: string) {
    return this.db('users').where({ google_id: googleId }).select('*').first();
  }

  async findUserByEmail(email: string) {
    return this.db('users').where({ email }).select('*').first();
  }

  async findUserById(id: string) {
    return this.db('users').where({ id }).select('*').first();
  }

  // Topics
  async createTopic(topicData: {
    user_id: string;
    title: string;
    category: string;
    notes: string;
    code_snippet?: string;
    source_url?: string;
    problem_type?: string;
    key_concept?: string;
    expected_output?: string;
    mistake?: string;
    difficulty?: string;
    revision_pattern?: string;
  }) {
    const [topic] = await this.db('topics').insert({...topicData, created_at: this.clock.now(), updated_at: this.clock.now()}).returning('*');
    return topic;
  }

  async findTopicsByUserId(userId: string) {
    return this.db('topics')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  }

  async findTopicById(id: string) {
    return this.db('topics').where({ id }).first();
  }

  async updateTopic(id: string, updateData: {
    title?: string;
    category?: string;
    notes?: string;
    code_snippet?: string;
    source_url?: string;
    problem_type?: string;
    key_concept?: string;
    expected_output?: string;
    mistake?: string;
    difficulty?: string;
    revision_pattern?: string;
  }) {
    const [topic] = await this.db('topics')
      .where({ id })
      .update(updateData)
      .returning('*');
    return topic;
  }

  async deleteTopic(id: string) {
    return this.db('topics').where({ id }).del();
  }

  // Revisions
  async createRevision(revisionData: {
    topic_id: string;
    user_id: string;
    due_date: Date;
    revision_day?: number;
    status: string;
    revision_pattern?: string;
    schedule_type?: string;
    strength_score?: number;
  }) {
    const [revision] = await this.db('revisions').insert({...revisionData, created_at: this.clock.now()}).returning('*');
    return revision;
  }

  async createRevisions(revisions: any[]) {
    return this.db('revisions').insert(revisions);
  }

  async findTodayRevisions(userId: string) {
    const today = this.clock.today();
    const tomorrow = this.clock.tomorrow();

    return this.db('revisions')
      .join('topics', 'revisions.topic_id', 'topics.id')
      .where({
        'revisions.user_id': userId,
        'revisions.status': 'pending',
      })
      .whereBetween('revisions.due_date', [today, tomorrow])
      .select(
        'revisions.*',
        'topics.title',
        'topics.category',
        'topics.notes',
        'revisions.revision_day'
      )
      .orderBy('revisions.due_date', 'asc');
  }

  async findRevisionById(id: string) {
    return this.db('revisions')
      .join('topics', 'revisions.topic_id', 'topics.id')
      .where('revisions.id', id)
      .select(
        'revisions.*',
        'topics.title',
        'topics.category',
        'topics.notes',
        'topics.strength_score',
        'revisions.revision_day'
      )
      .first();
  }

  async updateRevision(id: string, updateData: {
    status?: string;
    confidence?: string;
    next_due_date?: Date;
    completed_at?: Date;
    missed_count?: number;
  }) {
    const [revision] = await this.db('revisions')
      .where({ id })
      .update(updateData)
      .returning('*');
    return revision;
  }

  async updateTopicStrength(topicId: string, strengthScore: number) {
    const [topic] = await this.db('topics')
      .where({ id: topicId })
      .update({ strength_score: strengthScore })
      .returning('*');
    return topic;
  }

  async findAllRevisions(userId: string) {
    return this.db('revisions')
      .join('topics', 'revisions.topic_id', 'topics.id')
      .where('revisions.user_id', userId)
      .select(
        'revisions.*',
        'topics.title',
        'topics.category',
        'topics.notes',
        'topics.strength_score'
      )
      .orderBy('revisions.due_date', 'asc');
  }

  async findPendingRevisions(userId: string) {
    const today = this.clock.today();
    return this.db('revisions')
      .join('topics', 'revisions.topic_id', 'topics.id')
      .where({
        'revisions.user_id': userId,
        'revisions.status': 'pending_revision',
      })
      .where('revisions.due_date', '<', today)
      .select(
        'revisions.*',
        'topics.title',
        'topics.category',
        'topics.notes',
        'topics.strength_score'
      )
      .orderBy('revisions.due_date', 'asc');
  }

  async findUpcomingRevisions(userId: string) {
    const today = this.clock.today();
    const tomorrow = this.clock.tomorrow();
    return this.db('revisions')
      .join('topics', 'revisions.topic_id', 'topics.id')
      .where({
        'revisions.user_id': userId,
        'revisions.status': 'pending',
      })
      .where('revisions.due_date', '>', tomorrow)
      .select(
        'revisions.*',
        'topics.title',
        'topics.category',
        'topics.notes',
        'topics.strength_score'
      )
      .orderBy('revisions.due_date', 'asc');
  }

  async findCompletedRevisions(userId: string) {
    return this.db('revisions')
      .join('topics', 'revisions.topic_id', 'topics.id')
      .where({
        'revisions.user_id': userId,
        'revisions.status': 'completed',
      })
      .select(
        'revisions.*',
        'topics.title',
        'topics.category',
        'topics.notes',
        'topics.strength_score'
      )
      .orderBy('revisions.completed_at', 'desc');
  }

  async findRevisionHistory(revisionId: string) {
    return this.db('revision_history')
      .where({ revision_id: revisionId })
      .orderBy('scheduled_date', 'asc');
  }

  async createRevisionHistory(historyData: {
    revision_id: string;
    user_id: string;
    revision_day: number;
    scheduled_date: Date;
    completed_date?: Date;
    status: string;
    confidence?: string;
  }) {
    const [history] = await this.db('revision_history').insert({
      ...historyData,
      created_at: this.clock.now(),
    }).returning('*');
    return history;
  }

  async findWeakTopics(userId: string, limit: number = 5) {
    return this.db('topics')
      .where({ user_id: userId })
      .where('strength_score', '<', 70)
      .orderBy('strength_score', 'asc')
      .limit(limit)
      .select('id', 'title', 'category', 'strength_score');
  }

  // Practice Sessions
  async createPracticeSession(sessionData: {
    topic_id: string;
    user_id: string;
    question: string;
    answer: string;
    result: string;
  }) {
    const [session] = await this.db('practice_sessions').insert(sessionData).returning('*');
    return session;
  }

  async findPracticeSessionsByUserId(userId: string) {
    return this.db('practice_sessions')
      .join('topics', 'practice_sessions.topic_id', 'topics.id')
      .where('practice_sessions.user_id', userId)
      .select(
        'practice_sessions.*',
        'topics.title',
        'topics.category'
      )
      .orderBy('practice_sessions.completed_at', 'desc');
  }

  // Practice Sessions & Attempts
  async createPracticeSessionFull(sessionData: {
    user_id: string;
    score: number;
    total_questions: number;
    correct_count: number;
    incorrect_count: number;
    percentage: number;
    weak_areas: any;
  }) {
    const [session] = await this.db('practice_sessions').insert(sessionData).returning('*');
    return session;
  }

  // Practice Module - Legacy Question Methods (for topic-based questions)
  async createPracticeQuestion(questionData: {
    topic_id: string;
    type: string;
    question: string;
    options?: any;
    correct_answer: string;
    difficulty: number;
    weight: number;
  }) {
    const [question] = await this.db('questions').insert(questionData).returning('*');
    return question;
  }

  async findPracticeQuestionsByTopicId(topicId: string) {
    return this.db('questions')
      .where({ topic_id: topicId })
      .orderBy('created_at', 'desc');
  }

  async findAllPracticeQuestionsForUser(userId: string) {
    return this.db('questions')
      .join('topics', 'questions.topic_id', 'topics.id')
      .where('topics.user_id', userId)
      .select(
        'questions.*',
        'topics.title as topic_title',
        'topics.category',
        'topics.retention_score'
      );
  }

  async findWeakTopicPracticeQuestions(userId: string, limit: number = 10) {
    return this.db('questions')
      .join('topics', 'questions.topic_id', 'topics.id')
      .where('topics.user_id', userId)
      .where('topics.retention_score', '<', 60)
      .orderByRaw('RANDOM()')
      .limit(limit)
      .select(
        'questions.*',
        'topics.title as topic_title',
        'topics.category',
        'topics.retention_score'
      );
  }

  async findRandomPracticeQuestions(userId: string, limit: number = 10) {
    return this.db('questions')
      .join('topics', 'questions.topic_id', 'topics.id')
      .where('topics.user_id', userId)
      .orderByRaw('RANDOM()')
      .limit(limit)
      .select(
        'questions.*',
        'topics.title as topic_title',
        'topics.category',
        'topics.retention_score'
      );
  }

  async findPracticeQuestionsByTopic(topicId: string, limit: number = 10) {
    return this.db('questions')
      .join('topics', 'questions.topic_id', 'topics.id')
      .where('questions.topic_id', topicId)
      .orderByRaw('RANDOM()')
      .limit(limit)
      .select(
        'questions.*',
        'topics.title as topic_title',
        'topics.category'
      );
  }

  async updatePracticeQuestionLastAsked(questionId: string) {
    await this.db('questions')
      .where({ id: questionId })
      .update({ last_asked_at: this.clock.now() });
  }

  async findPracticeQuestionById(id: string) {
    return this.db('questions').where({ id }).first();
  }

  async createPracticeAttempt(attemptData: {
    session_id: string;
    question_id: string;
    selected_answer: string;
    is_correct: boolean;
    time_taken?: number;
  }) {
    const [attempt] = await this.db('practice_attempts').insert(attemptData).returning('*');
    return attempt;
  }

  async findSessionById(sessionId: string) {
    return this.db('practice_sessions').where({ id: sessionId }).first();
  }

  async findAttemptsBySessionId(sessionId: string) {
    return this.db('practice_attempts')
      .join('questions', 'practice_attempts.question_id', 'questions.id')
      .where({ session_id: sessionId })
      .select(
        'practice_attempts.*',
        'questions.question',
        'questions.correct_answer',
        'questions.topic_id'
      );
  }

  async updateTopicRetentionScore(topicId: string, score: number) {
    await this.db('topics')
      .where({ id: topicId })
      .update({ retention_score: score });
  }

  // User Settings - Custom Revision Schedule
  async findOrCreateUserSettings(userId: string) {
    let settings = await this.db('user_settings')
      .where({ user_id: userId })
      .first();

    if (!settings) {
      // Create default settings
      const [newSettings] = await this.db('user_settings')
        .insert({
          user_id: userId,
          revision_schedule: [1, 4, 7, 14, 30, 60, 90],
          created_at: this.clock.now(),
          updated_at: this.clock.now(),
        })
        .returning('*');
      settings = newSettings;
    }

    return settings;
  }

  async updateUserSettings(userId: string, revisionSchedule: number[]) {
    const [settings] = await this.db('user_settings')
      .where({ user_id: userId })
      .update({
        revision_schedule: revisionSchedule,
        updated_at: this.clock.now(),
      })
      .returning('*');
    return settings;
  }

  // Question Management Methods
  async createQuestion(questionData: {
    user_id: string;
    question: string;
    answer: string;
    category?: string | null;
    difficulty?: string;
    topic?: string | null;
    tags?: string[];
  }) {
    const [question] = await this.db('questions')
      .insert({
        ...questionData,
        times_asked: 0,
        times_correct: 0,
        created_at: this.clock.now(),
        updated_at: this.clock.now(),
      })
      .returning('*');
    return [question];
  }

  async findQuestionsByUser(userId: string, filters?: { category?: string; difficulty?: string }) {
    let query = this.db('questions').where({ user_id: userId });
    
    if (filters?.category) {
      query = query.where({ category: filters.category });
    }
    if (filters?.difficulty) {
      query = query.where({ difficulty: filters.difficulty });
    }
    
    return query.orderBy('created_at', 'desc');
  }

  async findQuestionById(id: string) {
    return this.db('questions').where({ id }).first();
  }

  async updateQuestion(id: string, questionData: Partial<{
    question: string;
    answer: string;
    category: string | null;
    difficulty: string;
    topic: string | null;
    tags: string[];
  }>) {
    const [updated] = await this.db('questions')
      .where({ id })
      .update({
        ...questionData,
        updated_at: this.clock.now(),
      })
      .returning('*');
    return [updated];
  }

  async deleteQuestion(id: string) {
    await this.db('questions').where({ id }).del();
  }

  async getRandomQuestions(userId: string, options: { count: number; category?: string; difficulty?: string }) {
    let query = this.db('questions').where({ user_id: userId });
    
    if (options.category) {
      query = query.where({ category: options.category });
    }
    if (options.difficulty) {
      query = query.where({ difficulty: options.difficulty });
    }
    
    // PostgreSQL random ordering
    return query.orderByRaw('RANDOM()').limit(options.count);
  }

  async recordQuestionAttempt(questionId: string, isCorrect: boolean) {
    const question = await this.findQuestionById(questionId);
    if (!question) return;

    await this.db('questions')
      .where({ id: questionId })
      .update({
        times_asked: question.times_asked + 1,
        times_correct: isCorrect ? question.times_correct + 1 : question.times_correct,
        updated_at: this.clock.now(),
      });
  }

  async getQuestionCategories(userId: string) {
    const result = await this.db('questions')
      .where({ user_id: userId })
      .distinct('category')
      .whereNotNull('category');
    return result.map(r => r.category).filter(Boolean);
  }

  // Transaction support
  async transaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }
}
