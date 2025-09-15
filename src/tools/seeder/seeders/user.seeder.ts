import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../features/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UserCredential } from '../../../features/users/entities/user-credential.entity';
import { ProviderType } from '../../../shared/types/auth.types';
import * as bcrypt from 'bcrypt';
import path from 'node:path';
import { CreateUserDto } from '../../../features/users/dto/create-user.dto';
import { CreateUserCredentialDto } from '../../../features/users/dto/create-user-credetial.dto';
import { readJsonFile } from '../../../shared/utils/read-json-file';
import { UserSeedData, SeedFileData } from '../data/seed-data.interface';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCredential)
    private readonly credentialRepository: Repository<UserCredential>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('🌱 Seeding users for Contraqo...');

    // Check if users already exist
    const existingUser = await this.userRepository.count();
    if (existingUser > 0) {
      this.logger.log('👤 Users already exist, skipping seed');
      return;
    }

    // Load seed data from JSON
    const seedData = await this.loadSeedData();
    this.logger.log(`📋 Loaded ${seedData.content.length} users from seed data (v${seedData.metadata.version})`);

    const users = await this.createUsersFromSeedData(seedData.content);
    this.logger.log(`✅ Created ${users.length} users with credentials`);
  }

  private async loadSeedData(): Promise<SeedFileData<UserSeedData[]>> {
    try {
      const dataPath = path.join(__dirname, '../data/users.json');

      const seedData = await readJsonFile<UserSeedData[]>(dataPath);

      // Validate seed data structure
      if (!seedData.content || !Array.isArray(seedData.content)) {
        throw new Error('Invalid seed data structure: missing users array');
      }

      if (!seedData.metadata) {
        throw new Error('Invalid seed data structure: missing metadata');
      }

      this.logger.log(`📁 Successfully loaded seed data: ${seedData.metadata.description}`);
      this.logger.debug(`🔍 Environment: ${seedData.metadata.environment}, Version: ${seedData.metadata.version}`);

      return seedData;
    } catch (err) {
      this.logger.error('❌ Failed to load seed data:', err.message);
      throw new Error(`Seed data loading failed: ${err.message}`);
    }
  }

  private async createUsersFromSeedData(usersData: UserSeedData[]): Promise<User[]> {
    const createdUsers: User[] = [];
    for (const userData of usersData) {
      try {
        const userDto: CreateUserDto = {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          emailVerified: userData.emailVerified,
          isSubscribed: userData.isSubscribed,
          isActive: userData.isActive,
        };
        // Create user entity using repository.create() for proper instantiation
        const user = this.userRepository.create(userDto);
        if (userData.trialEndsAt) {
          user.trialEndsAt = new Date(userData.trialEndsAt);
        }

        const savedUser = await this.userRepository.save(user);

        // Create email credential using DTO pattern
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const credentialDto: CreateUserCredentialDto = {
          userId: savedUser.id,
          providerType: ProviderType.EMAIL,
          providerId: userData.email,
          credentialData: hashedPassword,
          isPrimary: true,
          isVerified: userData.emailVerified,
        };

        const credential = this.credentialRepository.create(credentialDto);
        await this.credentialRepository.save(credential);

        createdUsers.push(savedUser);
      } catch (error) {
        this.logger.error(`❌ Failed to create user ${userData.email}:`, error.message);
        throw error;
      }
    }
    return createdUsers;
  }

  async clear(): Promise<void> {
    this.logger.log('🧹 Clearing users and credentials...');

    try {
      const credentialCount = await this.credentialRepository.count();
      const userCount = await this.userRepository.count();

      if (credentialCount === 0 && userCount === 0) {
        this.logger.log('📭 No data to clear - tables are already empty');
        return;
      }

      this.logger.log(`🔍 Found ${credentialCount} credentials and ${userCount} users to clear`);

      if (credentialCount > 0) {
        await this.credentialRepository.delete({});
        this.logger.debug(`🗑️ Cleared ${credentialCount} credentials`);
      }

      if (userCount > 0) {
        await this.userRepository.delete({});
        this.logger.debug(`🗑️ Cleared ${userCount} users`);
      }

      this.logger.log('✅ Users and credentials cleared successfully');
    } catch (error) {
      this.logger.error('❌ Failed to clear data:', error.message);
      throw error;
    }
  }
}
