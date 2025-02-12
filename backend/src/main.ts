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

// Load the right .env
const envFile = path.resolve(
  __dirname,
  "../../.env." + (process.env.NODE_ENV || "development")
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
          })
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
  // Retrieves necessary services from the application context.
  const databaseService = app.get(DatabaseService);

  try {
    /**
     * Initializes the database connection and retrieves the bucket.
     */
    console.log("COUCHBASE_PASSWORD:", process.env.DB_USER);
    console.log("COUCHBASE_BUCKET:", process.env.BUCKET_NAME);

    await databaseService.onModuleInit();
    const bucket = databaseService.getBucket();
    logger.log(
      "info",
      `✅ Successfully connected to bucket: ${process.env.BUCKET_NAME} (main.ts)`
    );
  } catch (error) {
    logger.error(`❌ Error while using the bucket (main.ts): ${error.message}`);
  }

  /**
   * Configures CORS to allow requests from the Angular frontend.
   */
  app.enableCors({
    origin: process.env.URL_FRONTEND,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  });

  /**
   * Starts the NestJS server on the configured port.
   */
  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port, "0.0.0.0");
  logger.log("info", `🚀 Application started at http://localhost:${port}`);
}

bootstrap();
