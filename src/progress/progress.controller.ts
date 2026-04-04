import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressService } from './progress.service';
import { ProgressQueryDto } from './dto/progress.dto';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get user progress summary and analytics' })
  @ApiResponse({ status: 200, description: 'Progress data retrieved successfully' })
  async getSummary(@Query() query: ProgressQueryDto) {
    // Get user ID from JWT token (this would be handled by a decorator in production)
    // For now, we'll use a placeholder - in real implementation, you'd extract from request
    const userId = '550e8400-e29b-41d4-a716-446655440001'; // John's ID for testing
    
    return this.progressService.getSummary(userId, query.period);
  }
}
