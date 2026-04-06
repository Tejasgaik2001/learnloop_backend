import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClockService } from './clock.service';
import { SetTimeDto, TravelDaysDto, TravelHoursDto, ClockStatusDto, TimeTravelResponseDto } from './dto/clock.dto';

@ApiTags('Clock')
@Controller('clock')
export class ClockController {
  constructor(private readonly clockService: ClockService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get current clock status (real or simulated time)' })
  @ApiResponse({ type: ClockStatusDto })
  getStatus(): ClockStatusDto {
    return {
      isSimulated: this.clockService.isSimulated(),
      simulatedDate: this.clockService.getSimulatedDate()?.toISOString(),
      currentTime: this.clockService.now().toISOString(),
      mode: this.clockService.isSimulated() ? 'SIMULATED' : 'REAL TIME',
    };
  }

  @Post('set')
  @HttpCode(200)
  @ApiOperation({ summary: 'Set a specific date for time travel simulation' })
  @ApiResponse({ type: TimeTravelResponseDto })
  setTime(@Body() dto: SetTimeDto): TimeTravelResponseDto {
    const previousTime = this.clockService.now().toISOString();
    this.clockService.setSimulatedDate(dto.date);
    const newTime = this.clockService.now().toISOString();

    return {
      message: `Time travel successful! Set date to ${newTime}`,
      previousTime,
      newTime,
      mode: 'SIMULATED',
    };
  }

  @Post('travel-days')
  @HttpCode(200)
  @ApiOperation({ summary: 'Travel forward or backward by number of days' })
  @ApiResponse({ type: TimeTravelResponseDto })
  travelDays(@Body() dto: TravelDaysDto): TimeTravelResponseDto {
    const previousTime = this.clockService.now().toISOString();
    this.clockService.travelDays(dto.days);
    const newTime = this.clockService.now().toISOString();

    const direction = dto.days > 0 ? 'forward' : 'backward';
    return {
      message: `Time travel successful! Moved ${direction} ${Math.abs(dto.days)} days`,
      previousTime,
      newTime,
      mode: 'SIMULATED',
    };
  }

  @Post('travel-hours')
  @HttpCode(200)
  @ApiOperation({ summary: 'Travel forward or backward by number of hours' })
  @ApiResponse({ type: TimeTravelResponseDto })
  travelHours(@Body() dto: TravelHoursDto): TimeTravelResponseDto {
    const previousTime = this.clockService.now().toISOString();
    this.clockService.travelHours(dto.hours);
    const newTime = this.clockService.now().toISOString();

    const direction = dto.hours > 0 ? 'forward' : 'backward';
    return {
      message: `Time travel successful! Moved ${direction} ${Math.abs(dto.hours)} hours`,
      previousTime,
      newTime,
      mode: 'SIMULATED',
    };
  }

  @Post('reset')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset to real time (exit simulation mode)' })
  @ApiResponse({ type: TimeTravelResponseDto })
  reset(): TimeTravelResponseDto {
    const previousTime = this.clockService.now().toISOString();
    this.clockService.resetToRealTime();
    const newTime = this.clockService.now().toISOString();

    return {
      message: 'Returned to real time. Simulation mode disabled.',
      previousTime,
      newTime,
      mode: 'REAL TIME',
    };
  }
}
