import {
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { log } from "console";
// Services
import { DatabaseService } from "src/database/database.service";

@Injectable()
/**
 * @brief Service responsible for handling administrative operations.
 * 
 * This service interacts with the database layer to retrieve product requests 
 * that require administrative review.
 */
export class AdminService {
  constructor(
    private databaseService: DatabaseService,
  ) { }

  /**
   * @brief Retrieves product requests from the database.
   * 
   * @return {Promise<any>} - A promise resolving to an array of product requests.
   * @throws {InternalServerErrorException} - If an error occurs during retrieval.
   */
  async getRequestsProduct(): Promise<any> {
    try {
      // Fetch product requests from the database service
      const requests = await this.databaseService.getRequests();

      // Return the retrieved requests
      return requests;
    } catch (error) {
      console.error('❌ Error in AdminService.getRequestsProduct:', error);
      throw new InternalServerErrorException('Unable to retrieve requests');
    }
  }

  /**
   * @brief Updates or deletes an entity (product or brand) based on status.
   * 
   * @details This method updates an entity in the database. If the `status` field 
   * is set to `'Rejected'`, the entity is deleted instead of being updated.
   * 
   * @param {string} type - The type of entity to update ("product" or "brand").
   * @param {string} entityId - The unique identifier of the entity.
   * @param {Record<string, any>} valueToUpdate - The fields to update.
   * 
   * @returns {Promise<any>} - The updated or deleted entity.
   * 
   * @throws {Error} If the entity ID or update fields are missing.
   */
  async updateEntity(type: string, entityId: string, valueToUpdate: Record<string, any>): Promise<any> {
    try {
      if (!entityId || Object.keys(valueToUpdate).length === 0) {
        throw new Error("Entity ID and at least one field to update are required");
      }

      // If the entity is rejected, delete it instead of updating
      if (valueToUpdate.status === 'Rejected') {
        return await this.databaseService.deleteEntity(type, entityId);
      }

      // Update the entity in the database
      return await this.databaseService.updateEntity(type, entityId, valueToUpdate);
    } catch (error) {
      console.error(`❌ Error in AdminService.updateEntity (${type}):`, error);
      throw new Error(`Error updating the ${type}`);
    }
  }

}
