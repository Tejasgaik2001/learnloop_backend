import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ClockService } from './clock.service';
import { ClockController } from './clock.controller';

@Module({
  controllers: [ClockController],
  providers: [DatabaseService, ClockService],
  exports: [DatabaseService, ClockService],
})
export class DatabaseModule {}
