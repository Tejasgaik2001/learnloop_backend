import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import type { UserSettings } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly db: DatabaseService) {}

  async getUserSettings(userId: string): Promise<UserSettings> {
    const settings = await this.db.findOrCreateUserSettings(userId);
    return {
      id: settings.id,
      user_id: settings.user_id,
      revision_schedule: settings.revision_schedule,
      created_at: settings.created_at,
      updated_at: settings.updated_at,
    };
  }

  async updateUserSettings(userId: string, revisionSchedule: number[]): Promise<UserSettings> {
    // Validate schedule - must be positive integers in ascending order
    const sortedSchedule = [...revisionSchedule].sort((a, b) => a - b);
    const validSchedule = sortedSchedule.filter(day => day > 0 && day <= 365);

    if (validSchedule.length === 0) {
      throw new Error('Revision schedule must contain at least one valid day (1-365)');
    }

    const settings = await this.db.updateUserSettings(userId, validSchedule);
    return {
      id: settings.id,
      user_id: settings.user_id,
      revision_schedule: settings.revision_schedule,
      created_at: settings.created_at,
      updated_at: settings.updated_at,
    };
  }

  async getRevisionSchedule(userId: string): Promise<number[]> {
    const settings = await this.db.findOrCreateUserSettings(userId);
    return settings.revision_schedule;
  }
}
