import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';
  return {
    type: 'postgres',
    url: process.env.POSTGRES_URL,
    entities: ['dist/**/*.entity.js'],
    autoLoadEntities: true,
    synchronize: isDevelopment,
    migrationsRun: isProduction,
    migrations: ['dist/migrations/*.js'],
    logging: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    extra: {
      min: 1,
    },
  };
});
