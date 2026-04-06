import { IsArray, IsNumber, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserSettingsDto {
  @ApiProperty({ 
    example: [1, 4, 7, 14, 30, 60, 90],
    description: 'Custom revision schedule days (e.g., [1, 4, 7] means revisions on day 1, 4, and 7 after learning)'
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  revisionSchedule: number[];
}

export class UserSettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ example: [1, 4, 7, 14, 30, 60, 90] })
  revisionSchedule: number[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  revision_schedule: number[];
  created_at: Date;
  updated_at: Date;
}
