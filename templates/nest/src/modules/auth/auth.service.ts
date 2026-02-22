import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ERRORS } from '@common/constants/errors.constants';
import { UserEntity } from '@modules/user/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from '@modules/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { LoginResponseDto } from './dto/login-response.dto';
import { parseDurationToSeconds } from '@common/utils/duration.utils';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersRepository: UsersRepository,
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserEntity | null> {
    const user = await this.userService.findOneByEmailWithPassword(email);

    if (user && user.password) {
      const isMatch = await this.userService.comparePassword(
        pass,
        user.password,
      );

      if (isMatch) {
        if (user.deletedAt) {
          throw new UnauthorizedException(ERRORS.AUTH.ACCOUNT_DELETED);
        }
        if (!user.isActive) {
          throw new UnauthorizedException(ERRORS.AUTH.ACCOUNT_DISABLED);
        }
        return user;
      }
    }
    return null;
  }

  async login(user: UserEntity): Promise<LoginResponseDto> {
    return this.generateAuthResponse(user);
  }

  async logout(jti: string): Promise<void> {
    if (!jti) {
      return;
    }
    const token = await this.refreshTokenRepository.findOne({
      where: { jti },
    });
    if (token) {
      token.isRevoked = true;
      await this.refreshTokenRepository.save(token);
    }
  }

  async refreshTokens(
    id: string,
    oldJti: string,
    refreshToken: string,
  ): Promise<LoginResponseDto> {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { jti: oldJti },
    });

    if (!tokenRecord || tokenRecord.isRevoked) {
      throw new ForbiddenException(ERRORS.AUTH.ACCESS_DENIED);
    }

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      tokenRecord.hashedToken,
    );

    if (!tokenMatches) {
      throw new ForbiddenException(ERRORS.AUTH.ACCESS_DENIED);
    }

    tokenRecord.isRevoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    const user = await this.userService.findById(id);
    if (!user) {
      throw new UnauthorizedException(ERRORS.AUTH.NOT_FOUND);
    }

    return this.generateAuthResponse(user);
  }

  private async generateAuthResponse(
    user: UserEntity,
  ): Promise<LoginResponseDto> {
    const jti = uuidv4();
    const { accessTokenExpiresIn, refreshTokenExpiresIn } =
      this.getExpirationTimes();

    const tokens = await this.getTokens(
      user,
      jti,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    );

    await this.createRefreshToken(user, jti, tokens.refreshToken);

    return {
      ...tokens,
      expiresIn: accessTokenExpiresIn,
      refreshExpiresIn: refreshTokenExpiresIn,
      user,
    };
  }

  private getExpirationTimes() {
    const expiresInConfig = this.configService.get<string>(
      'JWT_EXPIRATION_TIME',
    );
    const refreshExpiresInConfig = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION_TIME',
    );

    return {
      accessTokenExpiresIn: parseDurationToSeconds(expiresInConfig, 15 * 60),
      refreshTokenExpiresIn: parseDurationToSeconds(
        refreshExpiresInConfig,
        7 * 24 * 60 * 60,
      ),
    };
  }

  async createRefreshToken(
    user: UserEntity,
    jti: string,
    token: string,
  ): Promise<void> {
    const hashedToken = await bcrypt.hash(token, 10);
    const newRefreshToken = this.refreshTokenRepository.create({
      user: user,
      jti,
      hashedToken,
      isRevoked: false,
    });
    await this.refreshTokenRepository.save(newRefreshToken);
  }

  private async getTokens(
    user: UserEntity,
    jti: string,
    accessTokenExpiresIn: number,
    refreshTokenExpiresIn: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: accessTokenExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          jti,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: refreshTokenExpiresIn,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userService.findOneByIdWithPassword(id);

    if (!user) {
      throw new UnauthorizedException(ERRORS.AUTH.NOT_FOUND);
    }

    const isMatch = await this.userService.comparePassword(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(ERRORS.AUTH.OLD_PASSWORD_INCORRECT);
    }

    if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(ERRORS.AUTH.PASSWORD_SAME_AS_OLD);
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);

    await this.userService.updatePassword(id, hashedPassword);

    if (user.mustChangePassword) {
      await this.userService.disableMustChangePasswordFlag(id);
    }
    return { message: ERRORS.AUTH.PASSWORD_CHANGED };
  }
}
