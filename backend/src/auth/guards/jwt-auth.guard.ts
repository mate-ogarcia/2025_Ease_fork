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
    console.log("🔒 JwtAuthGuard - Headers:", request.headers);
    console.log("🔒 JwtAuthGuard - Cookies:", request.cookies);

    const token = this.extractTokenFromRequest(request);

    if (!token) {
      console.error("❌ No token found in request");
      throw new UnauthorizedException("Not authenticated");
    }

    console.log("🔑 Token found in request");
    return super.canActivate(context);
  }

  /**
   * @brief Extracts the JWT token from the request.
   * @details Checks for the token in cookies first, then in the Authorization header.
   *
   * @param {any} request - The HTTP request object.
   * @returns {string | null} The extracted token or null if not found.
   * @private
   */
  private extractTokenFromRequest(request: any): string | null {
    // Check cookies first
    if (request.cookies && request.cookies.accessToken) {
      console.log("🍪 Token found in cookies");
      return request.cookies.accessToken;
    }

    // Then check Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      console.log("🎯 Token found in Authorization header");
      return authHeader.substring(7);
    }

    console.warn("⚠️ No token found");
    return null;
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
    console.log("👤 Processing JWT request:", { error: err, user, info });

    if (err || !user) {
      console.error(
        "❌ Authentication error:",
        err?.message || "User not found",
      );
      throw new UnauthorizedException("Not authenticated");
    }

    console.log("✅ User authenticated:", {
      id: user.id,
      role: user.role,
    });
    return user;
  }
}
