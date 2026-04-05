import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseService } from '../common/database.service';
import { seedData } from './seed-data';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const databaseService = app.get(DatabaseService);
    await seedData(databaseService);
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
