import { DeepPartial, FindManyOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';
import { PaginatedResult } from './utils/pagination.utils';

export interface IRepository<T extends BaseEntity> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  create(data: DeepPartial<T>): Promise<T>;
  createInstance(data: DeepPartial<T>): T;
  update(id: string, data: QueryDeepPartialEntity<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
  findAllPaginated(
    options: FindManyOptions<T>,
    meta: { page: number; limit: number },
  ): Promise<PaginatedResult<T>>;
}
