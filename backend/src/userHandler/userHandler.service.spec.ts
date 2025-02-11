import { Test, TestingModule } from '@nestjs/testing';
import { UserHandler } from './userHandler.service';

describe('UserHandler', () => {
  let service: UserHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserHandler],
    }).compile();

    service = module.get<UserHandler>(UserHandler);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
