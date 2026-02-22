import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserEntity } from '@modules/user/entities/user.entity';

export class LoginResponseDto {
  @ApiProperty()
  @Expose()
  accessToken: string;

  @ApiProperty()
  @Expose()
  refreshToken: string;

  @ApiProperty({ type: 'number' })
  @Expose()
  expiresIn: number;

  @ApiProperty({ type: 'number' })
  @Expose()
  refreshExpiresIn: number;

  @ApiProperty({ type: () => UserEntity })
  @Expose()
  user: UserEntity;
}
