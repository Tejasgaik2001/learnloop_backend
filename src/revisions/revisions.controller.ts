import { Controller, Get, Post, Param, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RevisionsService } from './revisions.service';
import { CompleteRevisionDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Revisions')
@Controller('revisions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RevisionsController {
  constructor(private revisionsService: RevisionsService) {}

  @Get('today')
  @ApiOperation({ summary: 'Get revisions due today' })
  async getToday(@Request() req) {
    return this.revisionsService.getToday(req.user.userId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a revision' })
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteRevisionDto,
    @Request() req,
  ) {
    return this.revisionsService.complete(id, req.user.userId, dto);
  }
}
