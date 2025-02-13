/**
 * @file auth.module.ts
 * @brief Module for authentication management.
 *
 * This module provides authentication services, controllers, and strategies.
 * It integrates JWT authentication, Passport, and user management.
 */

import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      /**
       * @brief JWT configuration.
       * @details Uses a secret key from environment variables, with a fallback to a default value.
       */
      secret: process.env.JWT_SECRET || "DEFAULT_SECRET",
      signOptions: { expiresIn: "1h" },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
