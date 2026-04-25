import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async create(data: {
    name: string;
    email: string;
    passwordHash?: string;
    googleId?: string;
    authProvider?: string;
    avatarUrl?: string;
  }) {
    return this.db.createUser({
      name: data.name,
      email: data.email,
      password_hash: data.passwordHash,
      google_id: data.googleId,
      auth_provider: data.authProvider,
      avatar_url: data.avatarUrl,
    });
  }

  async findByGoogleId(googleId: string) {
    return this.db.findUserByGoogleId(googleId);
  }

  async findByEmail(email: string) {
    return this.db.findUserByEmail(email);
  }

  async findById(id: string) {
    return this.db.findUserById(id);
  }
}
