import { IsOptional, IsBoolean, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRidersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsIn(['createdAt', 'rating', 'name'])
  sortBy?: 'createdAt' | 'rating' | 'name' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
