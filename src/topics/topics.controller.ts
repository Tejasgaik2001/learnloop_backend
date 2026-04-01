import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { CreateTopicDto, UpdateTopicDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Topics')
@Controller('topics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TopicsController {
  constructor(private topicsService: TopicsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new topic' })
  async create(@Body() dto: CreateTopicDto, @Request() req) {
    return this.topicsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user topics' })
  async findAll(@Request() req) {
    return this.topicsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.topicsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update topic' })
  async update(@Param('id') id: string, @Body() dto: UpdateTopicDto, @Request() req) {
    return this.topicsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete topic' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.topicsService.remove(id, req.user.userId);
  }
}
