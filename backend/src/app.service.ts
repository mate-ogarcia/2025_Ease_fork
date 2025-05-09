import { Injectable } from "@nestjs/common";
// API
import { DatabaseService } from "./database/database.service";

@Injectable()
export class AppService {
  
  constructor (
    private dbService: DatabaseService
  ) {}

  /**
   * Retrieves raw data from the Couchbase database and applies a transformation.
   * Transformation :
   * - Convert `name` to uppercase
   * Add a `timestamp` field for each entry.
   * If the field is unknown then replace the field by UNKNOWN
   *
   * @returns {Promise<any[]>} A promise containing the transformed data.
   */
  async getData(): Promise<any[]> {
    const rawData = await this.dbService.getAllProductsData();

    const transformedData = rawData.map((item) => {
      // Accéder aux données imbriquées
      const product = item.ProductsBDD; // Change "ProductsBDD" selon ta structure réelle

      return {
        id: product?.id || null,
        name: product?.name ? product.name.toUpperCase() : "UNKNOWN",
        category: product?.category ? product.category : "UNKNOWN",
        isEuropean: product?.category ? product.category : "UNKNOWN",
        description: product?.description
          ? product.description
          : "NO DESCRIPTION",
        environmentalRate: product?.environmentalRate
          ? product.environmentalRate
          : "UNKNOWN",
        userRate: product?.userRate ? product.userRate : "UNKNOWN",
        satus: product?.satus ? product.satus : "UNKNOWN",
        tags: product?.tags ? product.tags : "No TAGS",

        timestamp: new Date().toISOString(),
      };
    });

    return transformedData;
  }
}