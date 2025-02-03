import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [DataController],
  providers: [DataService, DatabaseService],
})
export class DataModule {}
