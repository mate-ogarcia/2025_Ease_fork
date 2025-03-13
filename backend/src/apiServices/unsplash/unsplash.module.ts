
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UnsplashService } from './unsplash.service';
import { UnsplashController } from './unsplash.controller';

@Module({
  providers: [UnsplashService],
  imports: [
    HttpModule
  ],
  controllers: [UnsplashController],
  exports: [UnsplashService],
})
export class UnsplashModule {}
