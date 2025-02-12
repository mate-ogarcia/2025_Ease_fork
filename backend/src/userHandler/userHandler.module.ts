import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserHandlerService } from "./userHandler.service";
import { UserHandlerController } from "./userHandler.controller";
import { JwtStrategy } from "./userHandler.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "secretKey",
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [UserHandlerController],
  providers: [UserHandlerService, JwtStrategy],
  exports: [UserHandlerService],
})
export class UserHandlerModule {}
