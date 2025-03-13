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
import { RolesGuard } from "./guards/roles.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { DatabaseModule } from "../database/database.module";
import * as dotenv from "dotenv";
import { APP_GUARD } from "@nestjs/core";

dotenv.config(); // Load environment variables

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET || "DEFAULT_SECRET",
        signOptions: {
          expiresIn: process.env.JWT_EXPIRATION || "1d",
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule { }
