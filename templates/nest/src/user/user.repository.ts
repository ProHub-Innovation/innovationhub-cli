import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, IsNull } from 'typeorm';
import { BaseRepository } from '../common/base.repository';
import { UserEntity } from './entities/user.entity';
import { QueryUsersDto } from './dto/query-users.dto';
import { buildPaginationMeta } from '../common/utils/pagination.utils';

@Injectable()
export class UsersRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>,
  ) {
    super(repository);
  }

  async findById(id: string): Promise<UserEntity | null> {
    if (!id) {
      return null;
    }
    return this.repo.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.repo.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findAndCountUsers(queryUsersDto: QueryUsersDto) {
    const { page, limit, sortBy, sortOrder, search } = queryUsersDto;

    const queryBuilder = this.repo.createQueryBuilder('user');

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('user.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [users, totalItems] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      meta: buildPaginationMeta(totalItems, page, limit, users.length),
    };
  }
}
