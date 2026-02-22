import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { User } from '../common/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { plainToInstance } from 'class-transformer';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RefreshTokenPayload } from './interfaces/jwt-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Autentica um usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Usuário autenticado com sucesso.',
    type: LoginResponseDto,
  })
  async login(@User() user: UserEntity): Promise<LoginResponseDto> {
    const result = await this.authService.login(user);
    return plainToInstance(LoginResponseDto, result);
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Faz logout do usuário' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  logout(@User() user: RefreshTokenPayload & { refreshToken: string }) {
    return this.authService.logout(user.jti);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza os tokens de acesso' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens atualizados com sucesso.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'O refresh token é inválido ou expirou.',
  })
  async refreshTokens(
    @User() user: RefreshTokenPayload & { refreshToken: string },
  ): Promise<LoginResponseDto> {
    const { sub, jti, refreshToken } = user;
    const result = await this.authService.refreshTokens(sub, jti, refreshToken);
    return plainToInstance(LoginResponseDto, result);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Altera a senha do usuário logado' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiBody({ type: ChangePasswordDto })
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @User() user: UserEntity,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const id = user.id;
    return this.authService.changePassword(id, changePasswordDto);
  }
}
