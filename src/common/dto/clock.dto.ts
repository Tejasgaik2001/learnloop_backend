import { IsNumber, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetTimeDto {
  @ApiProperty({ example: '2026-04-10T00:00:00.000Z', description: 'ISO 8601 date string to simulate' })
  @IsISO8601()
  date: string;
}

export class TravelDaysDto {
  @ApiProperty({ example: 7, description: 'Number of days to travel (positive for future, negative for past)' })
  @IsNumber()
  days: number;
}

export class TravelHoursDto {
  @ApiProperty({ example: 24, description: 'Number of hours to travel (positive for future, negative for past)' })
  @IsNumber()
  hours: number;
}

export class ClockStatusDto {
  @ApiProperty()
  isSimulated: boolean;

  @ApiProperty({ required: false })
  simulatedDate?: string;

  @ApiProperty()
  currentTime: string;

  @ApiProperty()
  mode: string;
}

export class TimeTravelResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  previousTime: string;

  @ApiProperty()
  newTime: string;

  @ApiProperty()
  mode: string;
}
