import { Module } from '@nestjs/common';
import { UserHandler } from './userHandler.service';
import { UserHandlerController } from './userHandler.controller';


@Module({
  providers: [UserHandler],
  imports: [],
  controllers: [UserHandlerController],
  exports: [UserHandler],
})
export class UserHandlerModule {}