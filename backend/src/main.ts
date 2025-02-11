/**
 * @file main.ts
 * @brief Entry point for the NestJS application.
 *
 * This file initializes the NestJS application, sets up logging,
 * configures database connections, and starts the server.
 */

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DatabaseService } from "./database/database.service";
// Use of .env
import { ConfigService } from "@nestjs/config";
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

  /**
   * Retrieves necessary services from the application context.
   */
  const databaseService = app.get(DatabaseService);
  const configService = app.get(ConfigService);

  try {
    /**
     * Initializes the database connection and retrieves the bucket.
     */
    await databaseService.onModuleInit();
    const bucket = databaseService.getBucket();
    logger.log(
      "info",
      `✅ Successfully connected to bucket: ${configService.get("BUCKET_NAME")} (main.ts)`
    );
  } catch (error) {
    logger.error(`❌ Error while using the bucket (main.ts): ${error.message}`);
  }

  /**
   * Configures CORS to allow requests from the Angular frontend.
   */
  app.enableCors({
    origin: configService.get("URL_FRONTEND"),
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  });

  /**
   * Starts the NestJS server on the configured port.
   */
  const port = configService.get("BACKEND_PORT") || 3000;
  await app.listen(port, "0.0.0.0");
  logger.log("info", `🚀 Application started at http://localhost:${port}`);
}

bootstrap();
