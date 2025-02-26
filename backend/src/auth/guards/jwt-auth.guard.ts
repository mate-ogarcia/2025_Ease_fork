import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log("🔒 JwtAuthGuard - Headers:", request.headers);
    console.log("🔒 JwtAuthGuard - Cookies:", request.cookies);

    const token = this.extractTokenFromRequest(request);

    if (!token) {
      console.error("❌ Aucun token trouvé dans la requête");
      throw new UnauthorizedException("Non authentifié");
    }

    console.log("🔑 Token trouvé dans la requête");
    return super.canActivate(context);
  }

  private extractTokenFromRequest(request: any): string | null {
    // Vérifier d'abord dans les cookies
    if (request.cookies && request.cookies.accessToken) {
      console.log("🍪 Token trouvé dans les cookies");
      return request.cookies.accessToken;
    }

    // Vérifier ensuite dans le header Authorization
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      console.log("🎯 Token trouvé dans le header Authorization");
      return authHeader.substring(7);
    }

    console.warn("⚠️ Aucun token trouvé");
    return null;
  }

  handleRequest(err: any, user: any, info: any) {
    console.log("👤 Traitement de la requête JWT:", { error: err, user, info });

    if (err || !user) {
      console.error(
        "❌ Erreur d'authentification:",
        err?.message || "Utilisateur non trouvé",
      );
      throw new UnauthorizedException("Non authentifié");
    }

    console.log("✅ Utilisateur authentifié:", {
      id: user.id,
      role: user.role,
    });
    return user;
  }
}
