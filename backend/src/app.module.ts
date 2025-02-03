import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DataModule, DatabaseModule],
})
export class AppModule {}
