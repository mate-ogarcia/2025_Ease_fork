import {
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
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
  ) {}

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
}
