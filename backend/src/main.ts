import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
// Utilisation du .env
import { ConfigService } from '@nestjs/config';
// Logger global
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  // Configurer Winston Logger
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

  // Charger l'application NestJS avec le logger global
  const app = await NestFactory.create(AppModule, { logger });

  // Récupérer les services nécessaires
  const databaseService = app.get(DatabaseService);
  const configService = app.get(ConfigService);

  try {
    // Initialisation de la base de données
    await databaseService.onModuleInit();
    const bucket = databaseService.getBucket();
    logger.log('info', `✅ Connexion réussie au bucket : ${configService.get('BUCKET_NAME')} (main.ts)`);
  } catch (error) {
    logger.error(`❌ Erreur lors de l’utilisation du bucket (main.ts) : ${error.message}`);
  }

  // Configurer CORS pour autoriser les requêtes Angular
  app.enableCors({
    origin: configService.get('URL_FRONTEND'),
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Lancer le serveur
  const port = configService.get('BACKEND_PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log('info', `🚀 Application démarrée sur http://localhost:${port}`);
}
bootstrap();
