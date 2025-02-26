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
       * @brief Extracts JWT from the request header.
       * @details Uses the `Authorization` header with a Bearer token.
       */
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.accessToken;
          if (!token) {
            return null;
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "DEFAULT_SECRET",
    });
  }

  /**
   * @brief Validates the JWT payload and checks if the user exists.
   * @details If the user is not found in the database, an exception is thrown.
   *
   * @param payload The decoded JWT payload.
   * @returns An object containing user details.
   * @throws {UnauthorizedException} If the user does not exist.
   */
  async validate(payload: any) {
    console.log("🔑 JWT Strategy - Validating payload:", payload);
    const user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      console.log("❌ JWT Strategy - User not found");
      throw new UnauthorizedException();
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
  }
}
