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

  // TODO
  async updateEntity(type: string, entityId: string, valueToUpdate: Record<string, any>): Promise<any> {
    try {
      if (!entityId || Object.keys(valueToUpdate).length === 0) {
        throw new Error("Entity ID and at least one field to update are required");
      }
  
      // Si l'entité est refusée, on la supprime
      if (valueToUpdate.status === 'Rejected') {
        return await this.databaseService.deleteEntity(type, entityId);
      }
  
      // Mise à jour de l'entité en base de données
      return await this.databaseService.updateEntity(type, entityId, valueToUpdate);
    } catch (error) {
      console.error(`❌ Error in AdminService.updateEntity (${type}):`, error);
      throw new Error(`Error updating the ${type}`);
    }
  }
  
}
