import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ERRORS } from '@common/constants/errors.constants';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { QueryUsersDto } from './dto/query-users.dto';
import { UsersRepository } from './user.repository';
import { BaseService } from '@common/base.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    private usersRepository: UsersRepository,
    private configService: ConfigService,
  ) {
    super(usersRepository);
  }

  async create(newUser: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.findOneByEmail(newUser.email);

    if (existingUser) {
      throw new BadRequestException(
        `${ERRORS.USER.EMAIL_IN_USE} (Email: ${newUser.email})`,
      );
    }

    const defaultPassword = this.configService.get<string>('DEFAULT_PASSWORD');
    if (!defaultPassword) {
      throw new InternalServerErrorException(
        ERRORS.USER.DEFAULT_PASSWORD_NOT_SET,
      );
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    return super.create({
      ...newUser,
      password: hashedPassword,
      mustChangePassword: true,
    });
  }

  async updateProfile(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity | null> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(ERRORS.USER.NOT_FOUND);
    }

    const dataToUpdate: UpdateUserDto = { ...updateUserDto };
    Object.assign(user, dataToUpdate);

    return this.usersRepository.repo.save(user);
  }

  async findAndCountUsers(queryUsersDto: QueryUsersDto) {
    return this.usersRepository.findAndCountUsers(queryUsersDto);
  }

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.repo.findOne({
      where: { email: email },
      select: ['id', 'email', 'name', 'isActive', 'role', 'mustChangePassword'],
    });
  }

  async findOneByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.usersRepository.repo.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'name',
        'isActive',
        'role',
        'mustChangePassword',
        'password',
        'deletedAt',
      ],
    });
  }

  async findOneByIdWithPassword(id: string): Promise<UserEntity | null> {
    return this.usersRepository.repo.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'password', 'mustChangePassword'],
    });
  }

  async comparePassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }

  async updatePassword(id: string, newPasswordHash: string): Promise<void> {
    await this.update(id, { password: newPasswordHash });
  }

  async resetPasswordByAdmin(id: string): Promise<{ message: string }> {
    const user = await this.findById(id);

    if (!user) throw new NotFoundException(ERRORS.USER.NOT_FOUND);

    const defaultPassword = this.configService.get<string>('DEFAULT_PASSWORD');
    if (!defaultPassword)
      throw new InternalServerErrorException(
        ERRORS.USER.DEFAULT_PASSWORD_NOT_SET,
      );

    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    await this.update(id, {
      password: hashedPassword,
      mustChangePassword: true,
    });

    return {
      message: `A senha do usuário ${user.name} foi resetada com sucesso`,
    };
  }

  async disableMustChangePasswordFlag(id: string): Promise<void> {
    await this.update(id, { mustChangePassword: false });
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.repo.softDelete(id);
  }
}
