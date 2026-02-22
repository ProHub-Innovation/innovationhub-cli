import {
  DeepPartial,
  FindOptionsOrder,
  Repository,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';
import { IRepository } from './irepository';
import { buildPaginationMeta, PaginatedResult } from './utils/pagination.utils';

export abstract class BaseRepository<
  T extends BaseEntity,
> implements IRepository<T> {
  constructor(protected readonly repository: Repository<T>) {}

  public get repo(): Repository<T> {
    return this.repository;
  }

  async findAll(): Promise<T[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' } as FindOptionsOrder<T>,
    });
  }

  async findById(id: string): Promise<T | null> {
    if (!id) {
      return null;
    }
    return this.repository.findOneBy({ id } as FindOptionsWhere<T>);
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  createInstance(data: DeepPartial<T>): T {
    return this.repository.create(data);
  }

  async update(id: string, data: QueryDeepPartialEntity<T>): Promise<T | null> {
    if (!id) {
      return null;
    }
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      return;
    }
    await this.repository.delete(id);
  }

  async findAllPaginated(
    options: FindManyOptions<T>,
    meta: { page: number; limit: number },
  ): Promise<PaginatedResult<T>> {
    const { page, limit } = meta;
    const [data, totalItems] = await this.repository.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: buildPaginationMeta(totalItems, page, limit, data.length),
    };
  }
}
