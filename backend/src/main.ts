/**
 * @file main.ts
 * @brief Entry point for the NestJS application.
 *
 * This file initializes the NestJS application, sets up logging,
 * configures database connections, and starts the server.
 */

// Use of .env
import * as dotenv from "dotenv";
import * as path from "path";
import * as cookieParser from "cookie-parser";

// Load the right .env
const envFile = path.resolve(
  __dirname,
  "../../.env." + (process.env.NODE_ENV || "development"),
);
dotenv.config({ path: envFile });
console.log(`🚀 Running in ${process.env.NODE_ENV} mode`);

// Other
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DatabaseService } from "./database/database.service";
// Global logger
import * as winston from "winston";
import { WinstonModule } from "nest-winston";

async function bootstrap() {
  /**
   * Configures the Winston logger for logging messages and errors.
   */
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
        filename: "logs/error.log",
        level: "error",
      }),
      new winston.transports.File({
        filename: "logs/combined.log",
      }),
    ],
  });

  // Load NestJS application with global logger
  const app = await NestFactory.create(AppModule, { logger });

  // Middleware pour parser les cookies
  app.use(cookieParser());

  // Middleware pour extraire le token JWT des cookies et l'ajouter à l'en-tête Authorization
  app.use((req, res, next) => {
    const token = req.cookies?.accessToken;
    if (token) {
      // Vérifier si l'en-tête Authorization existe déjà
      if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        req.headers.authorization = `Bearer ${token}`;
        console.log("🔄 Token extrait des cookies et ajouté à l'en-tête Authorization");
        console.log("🔑 Token ajouté:", token.substring(0, 20) + "...");
      } else {
        console.log("ℹ️ En-tête Authorization déjà présent:", req.headers.authorization.substring(0, 20) + "...");
      }
    } else {
      console.log("⚠️ Aucun token trouvé dans les cookies");
    }
    next();
  });

  // Retrieves necessary services from the application context.
  const databaseService = app.get(DatabaseService);

  try {
    /**
     * Initializes the database connection and retrieves the bucket.
     */
    await databaseService.onModuleInit();
    logger.log(
      "info",
      `✅ Successfully connected to bucket: ${process.env.BUCKET_NAME} (main.ts)`,
    );
  } catch (error) {
    logger.error(`❌ Error while using the bucket (main.ts): ${error.message}`);
  }

  // Configuration CORS avec support des credentials
  app.enableCors({
    origin: true, // Permet toutes les origines ou spécifiez votre domaine frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  /**
   * Starts the NestJS server on the configured port.
   */
  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port, "0.0.0.0");
  logger.log("info", `🚀 Application started at http://localhost:${port}`);
}

bootstrap();
