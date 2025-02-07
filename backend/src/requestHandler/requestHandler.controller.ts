import { Controller, Post, Body } from '@nestjs/common';
import { RequestHandler } from './requestHandler.service'; 

@Controller('request-handler')  
export class RequestHandlerController {
  constructor(private readonly requestHandlerService: RequestHandler) {}

  @Post('search')
  async handleProductSearch(@Body() body: { search: string }) {
    const { search } = body;
    console.log('Received search query:', search);
    
    // Call requestHandler.service to process the search
    return await this.requestHandlerService.processSearch(search);
  }
}
