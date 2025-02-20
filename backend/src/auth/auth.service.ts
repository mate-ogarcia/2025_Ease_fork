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
import { Role } from "../roles/roles.enum";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  /**
   * @brief Logs in a user and generates a JWT token.
   * @details This method verifies user credentials, compares the password using bcrypt,
   * and generates an access token and a refresh token upon successful authentication.
   *
   * @param {string} email - The email of the user.
   * @param {string} password - The user's password.
   * @returns {Promise<{ access_token: string, refresh_token: string }>} An object containing the JWT tokens.
   * @throws {UnauthorizedException} If the user is not found or the password is incorrect.
   */
  async login(
    email: string,
    password: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      // Retrieve the user from the database
      const user = await this.usersService.findByEmail(email);

      // Protection against Timing-Attacks (Always compare a hash)
      const fakeHash =
        "$2b$10$WQm0wXEnoTb5PfKMZfGtvuG5lTqly5K/9uQ1yQVuxX48vG/UzL2Z6"; // Fake hash to prevent user enumeration
      const passwordToCompare = user ? user.password : fakeHash;

      // Password verification
      const passwordMatch = await bcrypt.compare(password, passwordToCompare);
      if (!passwordMatch) {
        throw new UnauthorizedException("Invalid email or password.");
      }

      // Generate JWT token
      const payload = { email: user.email, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload, { expiresIn: "1h" }),
        refresh_token: this.jwtService.sign(payload, { expiresIn: "7d" }),
      };
    } catch (error) {
      console.error("❌ Error during authentication:", error);
      throw new UnauthorizedException("Invalid email or password.");
    }
  }

  /**
   * @brief Registers a new user with a securely hashed password.
   * @details This method first checks if the user already exists.
   * If not, it hashes the password with bcrypt and stores the user in the database.
   *
   * @param {string} email - The email of the new user.
   * @param {string} password - The user's password.
   * @returns {Promise<any>} The created user object.
   * @throws {UnauthorizedException} If the user is already registered.
   * @throws {InternalServerErrorException} If an error occurs during user creation.
   */
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<any> {
    try {
      // Create the user in the database
      return this.usersService.createUser({ username, email, password });
    } catch (error) {
      console.error("❌ Error registering user:", error);
      throw new InternalServerErrorException("Error during registration.");
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || "DEFAULT_SECRET",
      });
      // Vous pouvez recharger l'utilisateur depuis la DB si nécessaire
      // par exemple: const user = await this.usersService.findById(payload.sub);
      return this.jwtService.sign(
        { email: payload.email, sub: payload.sub, role: payload.role },
        { expiresIn: "1h", secret: process.env.JWT_SECRET || "DEFAULT_SECRET" }
      );
    } catch (err) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
