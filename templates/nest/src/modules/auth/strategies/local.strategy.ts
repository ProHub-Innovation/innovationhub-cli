import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ERRORS } from '@common/constants/errors.constants';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserEntity } from '@modules/user/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }
  async validate(email: string, password: string): Promise<UserEntity> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException(ERRORS.AUTH.INVALID_CREDENTIALS);
    }
    return user;
  }
}
