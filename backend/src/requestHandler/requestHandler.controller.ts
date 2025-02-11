import { Controller, Post, Body, Get, Query  } from '@nestjs/common';
import { RequestHandler } from './requestHandler.service'; 

@Controller('request-handler')  
export class RequestHandlerController {
  constructor(private readonly requestHandlerService: RequestHandler) {}

  @Post('search')
  async handleProductSearch(@Body() body: { search: string }) {
    console.log('Received search query:', body.search);

    // Call requestHandler.service to process the search
    const results = await this.requestHandlerService.processSearch(body.search); 
    // Return the search results as a JSON response to the frontend
    return results;
  }
}
