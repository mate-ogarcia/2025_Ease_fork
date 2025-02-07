import { Module } from '@nestjs/common';
import { RequestHandler } from './requestHandler.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [RequestHandler],
  imports: [
    DatabaseModule,
  ],
  exports: [RequestHandler],
})
export class RequestHandlerModule {}
