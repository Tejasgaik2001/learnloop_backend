import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteRevisionDto {
  @ApiProperty({ example: 'strong', enum: ['forgot', 'partial', 'strong'] })
  @IsString()
  @IsIn(['forgot', 'partial', 'strong'])
  confidence: 'forgot' | 'partial' | 'strong';
}
