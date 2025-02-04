import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService], // Important pour que d'autres modules puissent l'utiliser
})
export class DatabaseModule {}
