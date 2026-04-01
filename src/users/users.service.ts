import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return this.db.createUser({
      name: data.name,
      email: data.email,
      password_hash: data.passwordHash,
    });
  }

  async findByEmail(email: string) {
    return this.db.findUserByEmail(email);
  }

  async findById(id: string) {
    return this.db.findUserById(id);
  }
}
