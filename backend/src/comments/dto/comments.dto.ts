import { IsNotEmpty, IsString, IsNumber, IsDateString } from "class-validator";

export class CommentDto {
  @IsNotEmpty()
  @IsDateString()
  dateCom: string; // Date of the comment in ISO format (e.g., "2025-04-04")

  @IsNotEmpty()
  @IsString()
  contentCom: string; // Content of the comment

  @IsNotEmpty()
  @IsNumber()
  userRatingCom: number; // Rating given by the user (1 to 5)

  @IsNotEmpty()
  @IsString()
  userId: string; // User identifier (can be a string or number)

  @IsNotEmpty()
  @IsString()
  productId: string; // Product identifier

  @IsNotEmpty()
  @IsString()
  source: string; // Source of the commented product (e.g., "Internal", "External")
}
