import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config(); // Ensure env is loaded before super() uses it

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
    Logger.log(`Google Client ID Loaded: ${!!(configService.get('GOOGLE_CLIENT_ID') || process.env.GOOGLE_CLIENT_ID)}`, 'GoogleStrategy');
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    try {
      const result = await this.authService.validateOAuthLogin(profile);
      done(null, result); // pass the result (user + token) as req.user
    } catch (err) {
      done(err, false);
    }
  }
}
