import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserHandlerService {
  private users = [];

  constructor(private jwtService: JwtService) {}

  async findByEmail(email: string) {
    return this.users.find((user) => user.email === email);
  }

  async createUser(userDto: any) {
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    const user = { id: Date.now(), ...userDto, password: hashedPassword };
    this.users.push(user);
    return { id: user.id, email: user.email };
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return { id: user.id, email: user.email };
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }
}
