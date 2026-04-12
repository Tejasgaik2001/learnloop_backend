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

  @Get()
  @ApiOperation({ summary: 'Get all revisions for user' })
  async getAll(@Request() req) {
    return this.revisionsService.getAll(req.user.userId);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get revisions due today' })
  async getToday(@Request() req) {
    return this.revisionsService.getToday(req.user.userId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending (missed) revisions' })
  async getPending(@Request() req) {
    return this.revisionsService.getPending(req.user.userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming revisions' })
  async getUpcoming(@Request() req) {
    return this.revisionsService.getUpcoming(req.user.userId);
  }

  @Get('completed')
  @ApiOperation({ summary: 'Get completed revisions' })
  async getCompleted(@Request() req) {
    return this.revisionsService.getCompleted(req.user.userId);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get revision details with history' })
  async getDetails(@Param('id') id: string, @Request() req) {
    return this.revisionsService.getDetails(id, req.user.userId);
  }

  @Get('check-missed')
  @ApiOperation({ summary: 'Check and update missed revisions' })
  async checkMissed(@Request() req) {
    return this.revisionsService.checkMissedRevisions(req.user.userId);
  }

  @Get('weak-topics')
  @ApiOperation({ summary: 'Get topics needing attention (low strength score)' })
  async getWeakTopics(@Request() req) {
    return this.revisionsService.getWeakTopics(req.user.userId);
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
