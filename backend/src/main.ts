import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
// Use of .env
import { ConfigService } from '@nestjs/config';
// Global logger
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  // Configure Winston Logger
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
          }),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
      }),
    ],
  });

  // Load NestJS application with global logger
  const app = await NestFactory.create(AppModule, { logger });

  // Get the necessary services
  const databaseService = app.get(DatabaseService);
  const configService = app.get(ConfigService);

  try {
    // Database initialization
    await databaseService.onModuleInit();
    const bucket = databaseService.getBucket();
    logger.log('info', `✅ Connexion réussie au bucket : ${configService.get('BUCKET_NAME')} (main.ts)`);
  } catch (error) {
    logger.error(`❌ Erreur lors de l’utilisation du bucket (main.ts) : ${error.message}`);
  }

  // Configure CORS to allow Angular requests
  app.enableCors({
    origin: configService.get('URL_FRONTEND'),
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Launch server
  const port = configService.get('BACKEND_PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log('info', `🚀 Application démarrée sur http://localhost:${port}`);
}
bootstrap();
