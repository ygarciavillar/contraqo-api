import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './features/clients/clients.module';
import { UsersModule } from './features/users/users.module';
import { QuotesModule } from './features/quotes/quotes.module';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './core/database/database.module';
import { SeederModule } from './tools/seeder/seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`],
    }),
    ClientsModule,
    UsersModule,
    QuotesModule,
    DatabaseModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
