import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TopicsModule } from './topics/topics.module';
import { RevisionsModule } from './revisions/revisions.module';
import { PracticeModule } from './practice/practice.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './common/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TopicsModule,
    RevisionsModule,
    PracticeModule,
    DashboardModule,
  ],
})
export class AppModule {}
