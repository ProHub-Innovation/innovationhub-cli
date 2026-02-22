import { BaseEntity } from '@common/base.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenEntity extends BaseEntity {
  @Column({ unique: true })
  public jti: string;

  @Column()
  public hashedToken: string;

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens)
  public user: UserEntity;

  @Column({ default: false })
  public isRevoked: boolean;
}
