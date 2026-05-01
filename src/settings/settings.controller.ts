import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { UserSettingsDto, UserSettingsResponseDto } from './dto/settings.dto';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user revision schedule settings' })
  @ApiResponse({ type: UserSettingsResponseDto })
  async getSettings(@Request() req): Promise<UserSettingsResponseDto> {
    const settings = await this.settingsService.getUserSettings(req.user.userId);
    return {
      id: settings.id,
      userId: settings.user_id,
      revisionSchedule: settings.revision_schedule,
      createdAt: settings.created_at.toISOString(),
      updatedAt: settings.updated_at.toISOString(),
    };
  }

  @Put()
  @ApiOperation({ summary: 'Update user revision schedule settings' })
  @ApiResponse({ type: UserSettingsResponseDto })
  async updateSettings(
    @Request() req,
    @Body() dto: UserSettingsDto,
  ): Promise<UserSettingsResponseDto> {
    const settings = await this.settingsService.updateUserSettings(
      req.user.userId,
      dto.revisionSchedule,
    );
    return {
      id: settings.id,
      userId: settings.user_id,
      revisionSchedule: settings.revision_schedule,
      createdAt: settings.created_at.toISOString(),
      updatedAt: settings.updated_at.toISOString(),
    };
  }
}
