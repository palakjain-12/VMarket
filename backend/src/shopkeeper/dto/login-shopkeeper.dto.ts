import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginShopkeeperDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}