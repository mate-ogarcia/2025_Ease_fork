import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const databaseService = app.get(DatabaseService);

  try {
    // Attendre la connexion complète avant d'utiliser le bucket
    await databaseService.onModuleInit();
    const bucket = databaseService.getBucket();
    console.log(`✅ Connexion réussie au bucket : ${bucket.name} (main.ts)`);
  } catch (error) {
    console.error('❌ Erreur lors de l’utilisation du bucket (main.ts) :', error.message);
  }

    // Active CORS pour permettre les requêtes Angular (http://localhost:4200)
    app.enableCors({
      origin: 'http://localhost:4200', 
      methods: 'GET,POST,PUT,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization',
    });

  await app.listen(3000, '0.0.0.0'); // Rend le serveur accessible depuis le réseau Docker
}
bootstrap();
