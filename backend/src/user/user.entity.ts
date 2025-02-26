export type UserRole = "Admin" | "User";

export class User {
  id: string;
  type: string = "user";
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
    this.createdAt = new Date();
  }
}
