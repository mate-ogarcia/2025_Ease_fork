import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  /**
   * @brief Retrieves and transforms data from the Couchbase database through the AppService.
   * 
   * This method intercepts a GET request to the `/data` endpoint, retrieves raw data from the database
   * via the `AppService`, and transforms it by applying various data transformations.
   * 
   * @returns {Promise<any[]>} A promise that resolves to an array of transformed data.
   */
  @Get('data') // Route: http://localhost:3000/data
  async getData(): Promise<any[]> {
    return await this.appService.getData();
  }
}
