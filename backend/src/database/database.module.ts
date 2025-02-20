/**
 * @file database.module.ts
 * @brief Module for database-related services.
 *
 * This module provides the database service and its dependencies.
 */

import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { DatabaseController } from "./database.controller";
import { HttpModule } from "@nestjs/axios";

@Module({
  providers: [DatabaseService],
  imports: [HttpModule],
  exports: [DatabaseService],
  controllers: [DatabaseController],
})
export class DatabaseModule {}
