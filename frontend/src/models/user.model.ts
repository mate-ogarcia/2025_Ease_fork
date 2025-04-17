/**
 * @file user.model.ts
 * @brief Interface representing a user entity in the system.
 */

export interface User {
  email: string;    // Email serves as unique identifier
  username: string;
  role: string;
  createdAt: Date;
} 