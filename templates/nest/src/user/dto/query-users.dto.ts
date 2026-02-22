import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '../../common/dto/base-query.dto';

export class QueryUsersDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Coluna pela qual os resultados serão ordenados.',
    default: 'id',
    example: 'name',
    enum: ['id', 'name', 'email', 'isActive', 'role', 'mustChangePassword'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['id', 'name', 'email', 'isActive', 'role', 'mustChangePassword'])
  override sortBy?: string = 'id';

  @ApiPropertyOptional({
    description: 'Ordem da classificação (ascendente ou descendente).',
    default: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  override sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
