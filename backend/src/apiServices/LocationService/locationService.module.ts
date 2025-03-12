
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LocationService } from './locationService ';
import { LocationController } from './locationService.controller';
@Module({
  providers: [LocationService],
  imports: [
    HttpModule
  ],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}
