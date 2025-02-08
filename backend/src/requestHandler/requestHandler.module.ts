import { Module } from '@nestjs/common';
import { RequestHandler } from './requestHandler.service';
import { RequestHandlerController } from './requestHandler.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [RequestHandler],
  imports: [
    DatabaseModule,
  ],
  controllers: [RequestHandlerController],
  exports: [RequestHandler],
})
export class RequestHandlerModule {}
