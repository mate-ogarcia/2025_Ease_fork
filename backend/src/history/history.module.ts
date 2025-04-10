/**
 * @file history.module.ts
 * @brief History module for the NestJS application
 * 
 * This module groups all elements related to managing
 * user search history.
 */

import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { DatabaseModule } from '../database/database.module';

/**
 * @class HistoryModule
 * @brief Module for managing search history
 */
@Module({
  imports: [DatabaseModule],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService]
})
export class HistoryModule { }
