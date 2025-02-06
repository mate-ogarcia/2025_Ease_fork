import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { DataModule } from './data/data.module';
import { AppService } from './app.service';
// Utilisation du .env
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';


@Module({
  imports: [DatabaseModule,
    DataModule,
    // Charger les variables d'environnement et valider avec Joi
    ConfigModule.forRoot({
      isGlobal: true, // Rendre les variables disponibles dans tous les modules
      envFilePath: '../.env', // Chemin vers le fichier .env
      validationSchema: Joi.object({
        BUCKET_NAME: Joi.string().required(),
        URL_FRONTEND: Joi.string().uri().required(),
        BACKEND_PORT: Joi.number().required(),
      }),
    }),
  ],  // Import des modules distant uniquement
  controllers: [AppController],
  providers: [AppService],                // Import des services de app 
})
export class AppModule { }
