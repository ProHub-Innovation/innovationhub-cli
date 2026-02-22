import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Role } from '../../auth/enums/role.enum';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({
    description: 'O endereço de e-mail do usuário',
    example: 'joao.silva@exemplo.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'O nome completo do usuário',
    example: 'João da Silva',
  })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Status de ativação do usuário',
    default: true,
    required: false,
  })
  @Transform(({ value }: { value: string | boolean }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'A função do novo usuário (opcional, padrão será "user").',
    enum: Role,
    required: false,
    default: Role.User,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
