/**
 * @file jwt-auth.guard.ts
 * @brief Main guard for JWT authentication.
 *
 * This guard verifies the presence and validity of the JWT token in cookies or headers.
 * It serves as the first line of defense to protect routes requiring authentication.
 * 
 * NOTE: This guard is the main guard for JWT authentication and should be used
 * instead of auth.guard.ts located in the parent directory.
 */

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  /**
   * @brief Determines if the request can proceed based on JWT token.
   * @details Checks for a valid JWT token in the request cookies or headers.
   *
   * @param {ExecutionContext} context - The execution context of the request.
   * @returns {boolean | Promise<boolean> | Observable<boolean>} Whether the request is authorized.
   * @throws {UnauthorizedException} If no token is found.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log("🔒 JwtAuthGuard - Path:", request.path);
    console.log("🔒 JwtAuthGuard - Method:", request.method);

    // Vérifier si l'en-tête Authorization est présent ou si le token est dans les cookies
    const hasAuthHeader = !!request.headers.authorization;
    const hasCookieToken = request.cookies && request.cookies.accessToken;

    if (!hasAuthHeader && !hasCookieToken) {
      console.error("❌ JwtAuthGuard - No Authorization header or cookie token found in request");
      throw new UnauthorizedException("Not authenticated");
    }

    if (hasAuthHeader) {
      console.log("🔑 JwtAuthGuard - Authorization header found:", request.headers.authorization.substring(0, 20) + "...");
    } else if (hasCookieToken) {
      console.log("🍪 JwtAuthGuard - Cookie token found:", request.cookies.accessToken.substring(0, 20) + "...");
      // Ajouter manuellement l'en-tête Authorization pour que la stratégie JWT puisse le trouver
      request.headers.authorization = `Bearer ${request.cookies.accessToken}`;
      console.log("🔄 JwtAuthGuard - Token extracted from cookies and added to Authorization header");
    }

    try {
      // Appeler la méthode parent pour valider le token et attacher l'utilisateur à la requête
      const result = super.canActivate(context);

      // Ajouter un log après l'activation pour vérifier si l'utilisateur est attaché à la requête
      if (result instanceof Promise) {
        return result.then(value => {
          console.log("✅ JwtAuthGuard - canActivate successful (Promise)");
          console.log("👤 JwtAuthGuard - User in request after canActivate:", request.user ? {
            id: request.user.id,
            email: request.user.email,
            role: request.user.role
          } : "No user found");
          return value;
        }).catch(err => {
          console.error("❌ JwtAuthGuard - canActivate error (Promise):", err.message);
          throw err;
        });
      } else if (result instanceof Observable) {
        // Pour les observables, nous ne pouvons pas facilement ajouter des logs ici
        // Les logs seront gérés dans handleRequest
        console.log("ℹ️ JwtAuthGuard - canActivate returned Observable");
        return result;
      } else {
        // Pour les résultats booléens
        console.log("ℹ️ JwtAuthGuard - canActivate returned boolean:", result);
        console.log("👤 JwtAuthGuard - User in request after canActivate:", request.user ? {
          id: request.user.id,
          email: request.user.email,
          role: request.user.role
        } : "No user found");
        return result;
      }
    } catch (error) {
      console.error("❌ JwtAuthGuard - Error in canActivate:", error.message);
      throw new UnauthorizedException("Authentication failed");
    }
  }

  /**
   * @brief Handles the result of the authentication process.
   * @details Processes the authenticated user or throws an exception if authentication fails.
   *
   * @param {any} err - Any error that occurred during authentication.
   * @param {any} user - The authenticated user if successful.
   * @param {any} info - Additional information about the authentication process.
   * @returns {any} The authenticated user.
   * @throws {UnauthorizedException} If authentication fails or no user is found.
   */
  handleRequest(err: any, user: any, info: any) {
    console.log("👤 JwtAuthGuard - Processing JWT request:", {
      error: err ? { message: err.message } : null,
      userExists: !!user,
      info: info ? { message: info.message } : null
    });

    if (err || !user) {
      console.error(
        "❌ JwtAuthGuard - Authentication error:",
        err?.message || "User not found",
      );
      throw new UnauthorizedException("Not authenticated");
    }

    console.log("✅ JwtAuthGuard - User authenticated:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return user;
  }
}
