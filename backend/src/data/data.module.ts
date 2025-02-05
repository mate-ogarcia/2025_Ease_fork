import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule], // Import de DatabaseModule pour l'accès aux données
  controllers: [DataController],
  providers: [DataService],
  exports: [DataService], // Ajout de DataService à exports pour l'utiliser ailleurs
})
export class DataModule {}
