import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { DataModule } from './data/data.module'; 

@Module({
  imports: [DatabaseModule, DataModule],
  controllers: [AppController], 
})
export class AppModule {}
