import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    const token = this.generateToken(user.id, user.email);
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(dto: LoginDto) {
  const user = await this.usersService.findByEmail(dto.email);

  if (!user) {
    console.log('User not found for email:', dto.email);
    throw new UnauthorizedException('Invalid credentials');
  }

  console.log('Entered password:', dto.password);
  console.log('Stored hash:', user.password_hash);

  const isPasswordValid = await bcrypt.compare(
    dto.password,
    user.password_hash
  );

  console.log('Password match result:', isPasswordValid);

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const token = this.generateToken(user.id, user.email);

  return {
    user: this.sanitizeUser(user),
    token,
  };
}

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }

  private sanitizeUser(user: any) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}
