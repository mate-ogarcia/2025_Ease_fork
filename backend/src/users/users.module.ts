import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { DatabaseService } from "../database/database.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  providers: [UsersService, DatabaseService],
  exports: [UsersService],
})
export class UsersModule {}
