import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'O endereço de e-mail do usuário',
    example: 'joao.silva@exemplo.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'A senha do usuário' })
  @IsNotEmpty()
  password!: string;
}
