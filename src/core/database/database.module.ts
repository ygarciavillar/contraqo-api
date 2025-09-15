import { Module } from '@nestjs/common';
import databaseConfig from './database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forRootAsync(databaseConfig.asProvider())],
})
export class DatabaseModule {}
