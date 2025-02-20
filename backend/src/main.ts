import * as dotenv from "dotenv";
import * as path from "path";

// Load the right .env
const envFile = path.resolve(
  __dirname,
  "../../.env." + (process.env.NODE_ENV || "development")
);
dotenv.config({ path: envFile });
console.log(`🚀 Running in ${process.env.NODE_ENV} mode`);

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DatabaseService } from "./database/database.service";
import * as winston from "winston";
import { WinstonModule } from "nest-winston";
import * as cookieParser from "cookie-parser";
// import csurf from "csurf";
const csurf = require("csurf");

import helmet from "helmet";

async function bootstrap() {
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

  // Retrieve database service
  const databaseService = app.get(DatabaseService);
  try {
    await databaseService.onModuleInit();
    logger.log(
      "info",
      `✅ Successfully connected to bucket: ${process.env.BUCKET_NAME} (main.ts)`
    );
  } catch (error) {
    logger.error(`❌ Error while using the bucket (main.ts): ${error.message}`);
  }

  // ✅ Sécurisation des cookies
  app.use(cookieParser());

  // ✅ Protection CSRF (empêche les attaques sur les requêtes POST, PUT, DELETE)

  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      },
      ignoreMethods: ["GET", "HEAD", "OPTIONS"], // ✅ Ignore les requêtes GET
    })
  );

  // ✅ Protection XSS, Clickjacking, etc.
  app.use(helmet());

  // ✅ Sécurisation CORS (autorise uniquement le frontend défini dans .env)
  app.enableCors({
    origin: process.env.URL_FRONTEND,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  });

  // ✅ Cache les infos NestJS (empêche la fuite du header "X-Powered-By")
  app.use((req, res, next) => {
    res.removeHeader("X-Powered-By");
    next();
  });

  // ✅ Lancement du serveur
  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port, "0.0.0.0");
  logger.log("info", `🚀 Application started at http://localhost:${port}`);
}

bootstrap();
