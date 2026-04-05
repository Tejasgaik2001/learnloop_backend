import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import knex, { Knex } from 'knex';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Knex;

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
    password_hash: string;
  }) {
    const [user] = await this.db('users').insert(userData).returning('*');
    return user;
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
  }) {
    const [topic] = await this.db('topics').insert(topicData).returning('*');
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
  }) {
    const [revision] = await this.db('revisions').insert(revisionData).returning('*');
    return revision;
  }

  async createRevisions(revisions: any[]) {
    return this.db('revisions').insert(revisions);
  }

  async findTodayRevisions(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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

  // Practice Module - Questions
  async createQuestion(questionData: {
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

  async findQuestionsByTopicId(topicId: string) {
    return this.db('questions')
      .where({ topic_id: topicId })
      .orderBy('created_at', 'desc');
  }

  async findAllQuestionsForUser(userId: string) {
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

  async findWeakTopicQuestions(userId: string, limit: number = 10) {
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

  async findRandomQuestions(userId: string, limit: number = 10) {
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

  async findQuestionsByTopic(topicId: string, limit: number = 10) {
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

  async updateQuestionLastAsked(questionId: string) {
    await this.db('questions')
      .where({ id: questionId })
      .update({ last_asked_at: new Date() });
  }

  async findQuestionById(id: string) {
    return this.db('questions').where({ id }).first();
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

  // Transaction support
  async transaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }
}
