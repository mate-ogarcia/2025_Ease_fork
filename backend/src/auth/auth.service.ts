/**
 * @file auth.service.ts
 * @brief Service for handling user authentication.
 *
 * This service manages user authentication, including login and registration.
 * It interacts with the UsersService to retrieve user data and handles password encryption
 * and JWT token generation.
 */

import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  /**
   * @brief Logs in a user and generates a JWT token.
   * @details This method verifies user credentials, hashes the password, and generates
   * an access token and a refresh token upon successful authentication.
   *
   * @param email The email of the user.
   * @param password The user's password.
   * @returns An object containing the access token and refresh token.
   * @throws {UnauthorizedException} If the user is not found or the password is incorrect.
   * @throws {InternalServerErrorException} If an error occurs during authentication.
   */
  async login(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) throw new UnauthorizedException("User not found.");

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch)
        throw new UnauthorizedException("Incorrect password.");

      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload, { expiresIn: "1h" }),
        refresh_token: this.jwtService.sign(payload, { expiresIn: "7d" }),
      };
    } catch (error) {
      console.error("❌ Error during authentication:", error);
      throw new InternalServerErrorException("Authentication failed.");
    }
  }

  /**
   * @brief Registers a new user with a hashed password.
   * @details This method checks if the user already exists, hashes the password,
   * and stores the new user in the database.
   *
   * @param email The email of the new user.
   * @param password The user's password.
   * @returns The created user object.
   * @throws {UnauthorizedException} If the user is already registered.
   */
  async register(email: string, password: string) {
    const existingUser = await this.usersService
      .findByEmail(email)
      .catch(() => null);
    if (existingUser) {
      throw new UnauthorizedException("User already registered.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.create({ email, password: hashedPassword });
  }
}
