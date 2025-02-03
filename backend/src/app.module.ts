import { Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { DataService } from './data/data.service';

@Module({
  providers: [DatabaseService, DataService],
  exports: [DatabaseService],
})
export class AppModule {}
