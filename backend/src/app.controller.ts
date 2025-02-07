import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RequestHandler } from './requestHandler/requestHandler.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly requestHandlerService: RequestHandler
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

  /**
   * @brief Receives data sent from the frontend and logs it to the backend console.
   * 
   * This method intercepts a POST request to the `/data` endpoint and logs the received data.
   * It then processes the received data using the `RequestHandlerService`.
   * 
   * @param {any} data - The data sent from the frontend.
   * @returns {Promise<void>} A promise that resolves once the data has been processed.
   */
  @Post('data') // POST route to receive data
  async receiveData(@Body() data: any): Promise<any> {
    console.log("✅  Data received from the frontend (backend):", data);
    // Call data processing
    const result = await this.requestHandlerService.processSearch(data.search);
  }
}
