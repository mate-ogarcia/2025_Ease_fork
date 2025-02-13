import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
// App component
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
// Module import
import { DatabaseModule } from "./database/database.module";
import { DataModule } from "./data/data.module";
import { AuthModule } from "./auth/auth.module";
import { ProductsModule } from "./products/products.module";
// Utilisation du .env
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
// Limiter nb de requetes
import { ThrottlerModule } from "@nestjs/throttler";
// Suivre requete HTTP
import { LoggingMiddleware } from "./logging.middleware";
import { RequestHandlerModule } from "./requestHandler/requestHandler.module";

@Module({
  imports: [
    DatabaseModule,
    DataModule,
    RequestHandlerModule,
    AuthModule,
    ProductsModule,
    // Charger les variables d'environnement et valider avec Joi
    ConfigModule.forRoot({
      isGlobal: true, // Rendre les variables disponibles dans tous les modules
      envFilePath: "../.env", // Chemin vers le fichier .env
      validationSchema: Joi.object({
        BUCKET_NAME: Joi.string().required(),
        URL_FRONTEND: Joi.string().uri().required(),
        BACKEND_PORT: Joi.number().required().default(3000),
      }),
    }),
    // Limiter le nombre de requete pour éviter attaque force brut
    ThrottlerModule.forRoot([
      {
        ttl: 60, // Durée de la fenêtre en secondes
        limit: 10, // Nombre max de requêtes autorisées par IP
      },
    ]),
  ],
  // Import des modules distant uniquement
  controllers: [AppController],
  providers: [AppService], // Import des services de app
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*"); // Appliquer le middleware à toutes les routes
  }
}
