import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProgressQueryDto {
  @ApiProperty({ required: false, description: 'Time period for progress data' })
  @IsOptional()
  @IsEnum(['week', 'month', 'all'])
  period?: 'week' | 'month' | 'all';
}
