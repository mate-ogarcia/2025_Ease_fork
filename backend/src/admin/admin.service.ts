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
   * @brief Updates a product request in the database.
   * 
   * @details This function ensures that the `productId` and at least one update field 
   * are provided before calling the `databaseService.updateProduct()` method to execute the update.
   * 
   * @param {string} productId - The unique ID of the product to update.
   * @param {Record<string, any>} valueToUpdate - An object containing the fields to update.
   * 
   * @returns {Promise<any>} - A promise resolving to the updated product data.
   * 
   * @throws {Error} If required parameters are missing or an error occurs during execution.
   */
  async updateRequest(productId: string, valueToUpdate: Record<string, any>): Promise<any> {
    try {
      // Ensure productId is provided and at least one field is being updated
      if (!productId || Object.keys(valueToUpdate).length === 0) {
        throw new Error("Product ID and at least one field to update are required");
      }
      // If the product is rejected by the admin then delete it from the database
      if (valueToUpdate.status === 'Rejected') {
        const rejectedProduct = await this.databaseService.deleteProduct(productId);
        return rejectedProduct;
      }

      // Call the database service to perform the update
      const updatedProduct = await this.databaseService.updateProduct(productId, valueToUpdate);

      return updatedProduct;
    } catch (error) {
      console.error("❌ Error in AdminService.updateRequest:", error);
      throw new Error("Error updating the product");
    }
  }
}
