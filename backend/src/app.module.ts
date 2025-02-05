import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { DataService } from './data/data.service';

@Module({
  imports: [DatabaseModule], 
  controllers: [AppController], 
  providers: [DataService], 
})
export class AppModule {}
