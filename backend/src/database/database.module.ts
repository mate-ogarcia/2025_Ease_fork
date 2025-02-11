/**
 * @file database.module.ts
 * @brief Module for database-related services.
 *
 * This module provides the database service and its dependencies.
 */

import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
