import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ERRORS } from '@common/constants/errors.constants';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'A senha atual (antiga) do usuário.',
    example: 'MinhaSenhaAntiga123',
  })
  @IsString()
  oldPassword!: string;

  @ApiProperty({
    description:
      'A nova senha que o usuário deseja definir. Deve ter no mínimo 8 caracteres.',
    example: 'NovaSenhaForte@2025',
  })
  @IsString()
  @MinLength(8, { message: ERRORS.AUTH.PASSWORD_MIN_LENGTH })
  newPassword!: string;
}
