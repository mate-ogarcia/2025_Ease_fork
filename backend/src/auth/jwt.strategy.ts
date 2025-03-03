/**
 * @file jwt.strategy.ts
 * @brief Strategy for handling JWT authentication.
 *
 * This strategy validates the JWT token extracted from the request header.
 * It ensures that the user exists in the database before granting access.
 */

import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { Request } from "express";
import * as dotenv from "dotenv";

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      /**
       * @brief Extracts JWT from the request header or cookies.
       * @details Uses the `Authorization` header with a Bearer token or the accessToken cookie.
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "DEFAULT_SECRET",
      passReqToCallback: true,
    });
    console.log("🔐 JWT Strategy initialized with secret:", (process.env.JWT_SECRET || "DEFAULT_SECRET").substring(0, 5) + "...");
  }

  /**
   * @brief Validates the JWT payload and checks if the user exists.
   * @details If the user is not found in the database, an exception is thrown.
   *
   * @param request The Express request object
   * @param payload The decoded JWT payload.
   * @returns An object containing user details.
   * @throws {UnauthorizedException} If the user does not exist.
   */
  async validate(request: Request, payload: any) {
    console.log("🔑 JWT Strategy - Validating payload:", payload);
    console.log("🔍 JWT Strategy - Request headers:", request.headers);
    console.log("🔍 JWT Strategy - Request cookies:", request.cookies);

    try {
      // Vérifier si le payload contient l'email
      if (!payload.email) {
        console.error("❌ JWT Strategy - Invalid payload: missing email");
        throw new UnauthorizedException("Invalid token payload");
      }

      const user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        console.log("❌ JWT Strategy - User not found for email:", payload.email);
        throw new UnauthorizedException("User not found");
      }

      console.log("✅ JWT Strategy - User validated:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      console.error("❌ JWT Strategy - Error during validation:", error.message);
      throw new UnauthorizedException("Authentication failed");
    }
  }
}
