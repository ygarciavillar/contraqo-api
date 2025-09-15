import { Injectable, Logger } from '@nestjs/common';
import { UserSeeder } from './seeders/user.seeder';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly userSeeder: UserSeeder) {}

  async seedAll(): Promise<void> {
    this.logger.log('🌱 Starting database seeding for Contraqo...');

    try {
      // ⚠️ IMPORTANT: Order matters - seed dependencies first
      await this.userSeeder.seed();

      // 🔜 Add more seeders in dependency order:
      // await this.businessProfileSeeder.seed();
      // await this.clientSeeder.seed();
      // await this.quoteSeeder.seed();

      this.logger.log('✅ Contraqo database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error.message);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.logger.log('🧹 Clearing Contraqo database...');

    try {
      // ⚠️ IMPORTANT: Clear in reverse dependency order
      // await this.quoteSeeder.clear();
      // await this.clientSeeder.clear();
      // await this.businessProfileSeeder.clear();
      await this.userSeeder.clear();

      this.logger.log('✅ Database cleared successfully!');
    } catch (error) {
      this.logger.error('❌ Database clearing failed:', error.message);
      throw error;
    }
  }

  async resetAndSeed(): Promise<void> {
    this.logger.log('🔄 Resetting and seeding Contraqo database...');
    await this.clear();
    await this.seedAll();
  }
}
