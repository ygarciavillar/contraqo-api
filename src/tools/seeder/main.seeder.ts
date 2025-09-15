import { Logger } from '@nestjs/common';
import { SeederModule } from './seeder.module';
import { NestFactory } from '@nestjs/core';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const logger = new Logger('ContraqoSeeder');

  try {
    const environment = process.env.NODE_ENV || 'development';
    logger.log(`🚀 Starting Contraqo Database Seeder (${environment})...`);

    const app = await NestFactory.createApplicationContext(SeederModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });

    const seederService = app.get(SeederService);

    logger.log('Command line arg', process.argv);

    const command = process.argv[2];

    logger.log(`📋 Executing command: ${command}`);

    const startTime = Date.now();
    switch (command) {
      case 'seed':
        logger.log('🌱 Seeding database...');
        await seederService.seedAll();
        break;

      case 'clear':
        logger.log('🧹 Clearing database...');
        await seederService.clear();
        break;

      case 'reset':
        logger.log('🔄 Resetting database (clear + seed)...');
        await seederService.resetAndSeed();
        break;

      default:
        logger.error(`❌ Unknown command: ${command}`);
        logger.log('📖 Available commands:');
        logger.log('   • seed  - Seed database with initial data');
        logger.log('   • clear - Clear all seeded data');
        logger.log('   • reset - Clear and seed (fresh start)');
        process.exit(1);
    }

    const duration = Date.now() - startTime;

    await app.close();

    logger.log(`🎉 Contraqo Seeder completed successfully in ${duration}ms!`);

    process.exit(0);
  } catch (error) {
    logger.error('💥 Contraqo Seeder failed:', error.message);
    logger.error(error.stack);
    process.exit(1);
  }
}

bootstrap();
