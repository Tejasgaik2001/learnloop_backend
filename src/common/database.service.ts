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
    return this.db('users').where({ email }).first();
  }

  async findUserById(id: string) {
    return this.db('users').where({ id }).first();
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

  // Transaction support
  async transaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }
}
