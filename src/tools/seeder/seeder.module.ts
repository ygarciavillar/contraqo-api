import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../features/users/entities/user.entity';
import { UserCredential } from '../../features/users/entities/user-credential.entity';
import { UserSeeder } from './seeders/user.seeder';
import { StateTaxSeeder } from './seeders/state-tax.seeder';
import { SeederService } from './seeder.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`],
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([User, UserCredential]),
  ],
  providers: [UserSeeder, StateTaxSeeder, SeederService],
})
export class SeederModule {}
