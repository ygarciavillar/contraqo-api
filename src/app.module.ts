import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import { UsersModule } from './users/users.module';
import { QuotesModule } from './quotes/quotes.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`],
    }),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    ClientsModule,
    UsersModule,
    QuotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
