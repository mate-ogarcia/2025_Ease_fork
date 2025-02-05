import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { DataModule } from './data/data.module'; 
import { AppService } from './app.service';

@Module({
  imports: [DatabaseModule, DataModule], // Import des modules distant uniquement
  controllers: [AppController],
  providers: [AppService], // Import des services de app 
})
export class AppModule {}
