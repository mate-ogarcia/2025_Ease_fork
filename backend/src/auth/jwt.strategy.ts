/**
 * @file jwt.strategy.ts
 * @brief Strategy for handling JWT authentication.
 *
 * This strategy validates the JWT token extracted from the request header.
 * It ensures that the user exists in the database before granting access.
 */

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      /**
       * @brief Extracts JWT from the request header.
       * @details Uses the `Authorization` header with a Bearer token.
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // TODO ??
      secretOrKey: process.env.JWT_SECRET,
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
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) throw new UnauthorizedException("User not found");

    return { userId: payload.sub, email: payload.email };
  }
}
