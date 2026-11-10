import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateRiderStatusDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
