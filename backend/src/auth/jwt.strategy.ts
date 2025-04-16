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
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Essayer d'abord d'extraire le token de l'en-tête Authorization
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Si ça échoue, essayer d'extraire le token des cookies
        (request) => {
          if (request && request.cookies && request.cookies.accessToken) {
            console.log("🍪 JWT Strategy - Found token in cookies:", request.cookies.accessToken.substring(0, 20) + "...");
            return request.cookies.accessToken;
          }
          console.log("⚠️ JWT Strategy - No token found in cookies");
          return null;
        }
      ]),
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
    console.log("🔍 JWT Strategy - Request path:", request.path);
    console.log("🔍 JWT Strategy - Request method:", request.method);

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

      // Debug - afficher l'utilisateur complet pour voir s'il contient un ID
      console.log("👤 JWT Strategy - User object from database:", JSON.stringify(user));

      // Créer un objet utilisateur simplifié pour attacher à la requête
      // Pour les favoris, nous avons besoin d'un identifiant "sub"
      const userInfo = {
        email: user.email,
        role: user.role,
        // Pour les favoris, utiliser l'email comme ID s'il n'y a pas d'ID spécifique
        // dans le format que la base de données Couchbase attend
        sub: user.email
      };

      console.log("✅ JWT Strategy - User validated:", userInfo);

      // Attacher l'utilisateur à la requête manuellement
      request.user = userInfo;

      // Vérifier que l'utilisateur est bien attaché à la requête
      console.log("✅ JWT Strategy - User attached to request:", request.user ? "Yes" : "No");

      return userInfo;
    } catch (error) {
      console.error("❌ JWT Strategy - Error during validation:", error.message);
      throw new UnauthorizedException("Authentication failed");
    }
  }
}
