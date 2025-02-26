/**
 * @file auth.service.ts
 * @brief Service for handling user authentication.
 *
 * This service manages user authentication, including login and registration.
 * It interacts with the UsersService to retrieve user data, hashes passwords using bcrypt,
 * and generates JWT tokens for authentication.
 */

import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "./enums/role.enum";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log("🔍 Validation de l'utilisateur:", email);
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      console.warn("⚠️ Utilisateur non trouvé");
      throw new UnauthorizedException("Utilisateur non trouvé");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn("⚠️ Mot de passe invalide");
      throw new UnauthorizedException("Mot de passe invalide");
    }

    console.log("✅ Utilisateur validé avec rôle:", user.role);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      console.log("🔑 Création du token pour l'utilisateur:", user.email);

      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
      };

      const access_token = this.jwtService.sign(payload);
      console.log("✅ Token généré avec succès");

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.username,
        },
      };
    } catch (error) {
      console.error("❌ Erreur lors de la connexion:", error.message);
      throw new UnauthorizedException(error.message);
    }
  }

  async register(
    username: string,
    email: string,
    password: string,
    role: UserRole = UserRole.USER,
  ) {
    console.log("📝 Enregistrement d'un nouvel utilisateur:", {
      username,
      email,
      role,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.usersService.createUser({
        username,
        email,
        password: hashedPassword,
        role,
      });

      console.log("✅ Utilisateur créé avec succès:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'utilisateur:", error);
      throw new InternalServerErrorException(
        "Erreur lors de la création de l'utilisateur",
      );
    }
  }

  /**
   * @brief Retrieves all users from the database.
   * @details This method is restricted to admin users only and returns a list of all registered users.
   *
   * @returns {Promise<any>} A list of all users in the system.
   * @throws {InternalServerErrorException} If an error occurs while retrieving users.
   */
  async findAll(): Promise<any> {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      console.error("❌ Error retrieving users:", error);
      throw new InternalServerErrorException("Error retrieving users list.");
    }
  }
}
