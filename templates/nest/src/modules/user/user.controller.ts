import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
  HttpCode,
  NotFoundException,
  HttpStatus,
  Query,
  Req,
  Delete,
} from '@nestjs/common';
import { ERRORS } from '@common/constants/errors.constants';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { Role } from '@modules/auth/enums/role.enum';
import { QueryUsersDto } from './dto/query-users.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Cria um novo usuário (admin)' })
  @ApiBody({
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso.',
    type: UserEntity,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retorna o perfil do usuário logado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário.',
    type: UserEntity,
  })
  async getMe(@Req() req: { user: { id: string } }): Promise<UserEntity> {
    const id = req.user.id;
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(ERRORS.USER.NOT_FOUND);
    }
    return user;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualiza o perfil do usuário logado' })
  @ApiBody({
    type: UpdateUserDto,
  })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso.',
    type: UserEntity,
  })
  async updateMe(
    @Req() req: { user: { id: string } },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const id = req.user.id;
    await this.userService.updateProfile(id, updateUserDto);
    return this.getMe(req);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Busca todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get('paginated')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Busca todos os usuários com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
  })
  findAndCountUsers(@Query() query: QueryUsersDto) {
    return this.userService.findAndCountUsers(query);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Busca usuários pelo Id' })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado.',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async findById(@Param('id') id: string): Promise<UserEntity> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(ERRORS.USER.NOT_FOUND);
    }
    return user;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Atualiza um usuário pelo ID (admin)' })
  @ApiBody({
    type: UpdateUserDto,
  })
  @HttpCode(204)
  @ApiResponse({ status: 204, description: 'Usuário atualizado com sucesso.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<void> {
    await this.userService.updateProfile(id, updateUserDto);
  }

  @Patch(':id/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reseta a senha de um usuário (admin)' })
  @ApiResponse({
    status: 200,
    description:
      'Senha resetada com sucesso. A nova senha foi enviada para o e-mail do usuário.',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async resetPasswordByAdmin(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.userService.resetPasswordByAdmin(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta um usuário (admin)' })
  @ApiResponse({ status: 204, description: 'Usuário deletado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
