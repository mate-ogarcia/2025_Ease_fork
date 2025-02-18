/**
 * @file auth.dto.ts
 * @brief Data Transfer Objects (DTO) for authentication requests.
 *
 * This file defines the DTOs used for user authentication,
 * including registration and login requests.
 */

import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

/**
 * @class RegisterDto
 * @brief DTO for user registration.
 *
 * This class defines the structure and validation rules for user registration requests.
 */
export class RegisterDto {

  /**
  * @property username
  * @brief The username of the user.
  * @details Must not be empty and have a minimum length of 1 character.
  */
  @IsNotEmpty()
  @MinLength(1)
  username: string;
  /**
   * @property email
   * @brief The email of the user.
   * @details Must be a valid email format.
   */
  @IsEmail()
  email: string;

  /**
   * @property password
   * @brief The password of the user.
   * @details Must not be empty and have a minimum length of 6 characters.
   */
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

/**
 * @class LoginDto
 * @brief DTO for user login.
 *
 * This class defines the structure and validation rules for user login requests.
 */
export class LoginDto {
  /**
   * @property email
   * @brief The email of the user.
   * @details Must be a valid email format.
   */
  @IsEmail()
  email: string;

  /**
   * @property password
   * @brief The password of the user.
   * @details Must not be empty.
   */
  @IsNotEmpty()
  password: string;
}
