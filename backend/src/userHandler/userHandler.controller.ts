import { Controller, Post, Body } from "@nestjs/common";
import { UserHandlerService } from "./userHandler.service";

@Controller("user")
export class UserHandlerController {
  constructor(private userHandlerService: UserHandlerService) {}

  @Post("login")
  async login(@Body() body) {
    const user = await this.userHandlerService.validateUser(
      body.email,
      body.password
    );
    if (user) {
      return this.userHandlerService.login(user);
    }
    return { message: "Invalid credentials" };
  }

  @Post("register")
  async register(@Body() body) {
    return this.userHandlerService.createUser(body);
  }
}
