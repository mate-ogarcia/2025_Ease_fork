import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService], // Déclare DatabaseService comme un fournisseur
  exports: [DatabaseService], // Permet aux autres modules d'utiliser DatabaseService
})
export class DatabaseModule {}
