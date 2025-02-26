import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { DatabaseModule } from "../database/database.module";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule],
  controllers: [AdminController],
})
export class AdminModule {}
