import { Test, TestingModule } from '@nestjs/testing';
import { RequestHandler } from './requestHandler.service';

describe('RequestHandler', () => {
  let service: RequestHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestHandler],
    }).compile();

    service = module.get<RequestHandler>(RequestHandler);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
