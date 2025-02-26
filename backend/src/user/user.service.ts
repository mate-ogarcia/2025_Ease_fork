import { Injectable, NotFoundException } from "@nestjs/common";
import { User, UserRole } from "./user.entity";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<User[]> {
    try {
      const result = await this.databaseService.getAllUsers();
      return result.map((row) => new User(row));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    try {
      const key = `user:${userId}`;
      const collection = this.databaseService.getUsersCollection();

      const result = await collection.get(key);
      if (!result.content) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const user = new User(result.content);
      user.role = role;

      await collection.replace(key, {
        ...result.content,
        role: role,
      });

      return user;
    } catch (error) {
      console.error(`Error updating user role for ID ${userId}:`, error);
      throw error;
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      const key = `user:${userId}`;
      const collection = this.databaseService.getUsersCollection();
      await collection.remove(key);
    } catch (error) {
      if (error.message.includes("document not found")) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      console.error(`Error deleting user with ID ${userId}:`, error);
      throw error;
    }
  }
}
