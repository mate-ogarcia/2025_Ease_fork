import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  /**
   * @brief A simple function that returns a "Hello World!" message for testing the `/` route.
   * 
   * This method handles GET requests at the root endpoint `/`.
   * It returns a simple greeting message for testing purposes.
   * 
   * @returns {string} A "Hello World!" message.
   */
  @Get() // Route: http://localhost:3000/
  getHello(): string {
    return this.appService.getHello();
  }

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
