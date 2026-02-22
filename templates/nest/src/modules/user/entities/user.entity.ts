import { Column, DeleteDateColumn, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@modules/auth/enums/role.enum';
import { Exclude, Expose } from 'class-transformer';
import { BaseEntity } from '@common/base.entity';
import { RefreshTokenEntity } from '@modules/auth/entities/refresh-token.entity';

@Entity('users')
@Exclude()
export class UserEntity extends BaseEntity {
  @Expose()
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'user@example.com',
  })
  @Column({ unique: true })
  email: string;

  @Expose()
  @ApiProperty({ description: 'Nome do usuário', example: 'João Silva' })
  @Column()
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Telefone do usuário',
    example: '+55 11 99999-9999',
    required: false,
  })
  @Column({ nullable: true })
  phone?: string;

  @Column({ select: false })
  password: string;

  @Expose()
  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Expose()
  @ApiProperty({ enum: Role, description: 'Papel do usuário no sistema' })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;

  @Expose()
  @Column({
    name: 'must_change_password',
    type: 'boolean',
    default: false,
  })
  mustChangePassword: boolean;

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshTokenEntity[];

  @Expose()
  @DeleteDateColumn()
  deletedAt: Date;
}
