import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { DatabaseModule } from '../database/database.module'; // Import du DatabaseModule

@Module({
  imports: [DatabaseModule], // Ajoutez DatabaseModule ici
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule {}
