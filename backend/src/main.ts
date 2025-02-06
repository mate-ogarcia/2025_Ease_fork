import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
// Utilisation du .env
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Charger l'application NestJS
  const app = await NestFactory.create(AppModule);
  // Récupérer les services
  const databaseService = app.get(DatabaseService);
  const configService = app.get(ConfigService);
  
  try {
    // Attendre la connexion complète avant d'utiliser le bucket
    await databaseService.onModuleInit();
    const bucket = databaseService.getBucket();
    console.log(`✅ Connexion réussie au bucket : ${configService.get('BUCKET_NAME')} (main.ts)`);
  } catch (error) {
    console.error('❌ Erreur lors de l’utilisation du bucket (main.ts) :', error.message);
  }

    // Active CORS pour permettre les requêtes Angular
    app.enableCors({
      origin: configService.get('URL_FRONTEND'), 
      methods: 'GET,POST,PUT,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization',
    });

  await app.listen(configService.get('BACKEND_PORT'), '0.0.0.0'); // Rend le serveur accessible depuis le réseau Docker
}
bootstrap();
