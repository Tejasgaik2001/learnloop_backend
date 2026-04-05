import { Controller, Get, Post, Body, Request, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PracticeService } from './practice.service';
import { SubmitPracticeDto, CreateQuestionDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Practice')
@Controller('practice')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PracticeController {
  constructor(private practiceService: PracticeService) {}

  @Get('random')
  @ApiOperation({ summary: 'Get random questions with weighted selection' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getRandom(
    @Request() req,
    @Query('limit') limit: number = 10,
  ) {
    return this.practiceService.getRandomQuestions(req.user.userId, parseInt(limit as any) || 10);
  }

  @Get('weak')
  @ApiOperation({ summary: 'Get questions from weak topics (retention < 60)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getWeak(
    @Request() req,
    @Query('limit') limit: number = 10,
  ) {
    return this.practiceService.getWeakQuestions(req.user.userId, parseInt(limit as any) || 10);
  }

  @Get('topic/:topicId')
  @ApiOperation({ summary: 'Get random questions from specific topic' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getByTopic(
    @Param('topicId') topicId: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.practiceService.getTopicQuestions(topicId, parseInt(limit as any) || 10);
  }

  @Get('mixed')
  @ApiOperation({ summary: 'Get mixed practice: 70% due revisions, 30% random questions' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getMixed(
    @Request() req,
    @Query('limit') limit: number = 10,
  ) {
    return this.practiceService.getMixedPractice(req.user.userId, parseInt(limit as any) || 10);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit practice session and get results' })
  async submit(
    @Body() dto: SubmitPracticeDto,
    @Request() req,
  ) {
    return this.practiceService.submitPractice(req.user.userId, dto);
  }

  @Post('questions')
  @ApiOperation({ summary: 'Create a new question (admin/seeding)' })
  async createQuestion(
    @Body() dto: CreateQuestionDto,
    @Request() req,
  ) {
    return this.practiceService.createQuestion({
      topic_id: dto.topicId,
      type: dto.type,
      question: dto.question,
      options: dto.options ? JSON.stringify(dto.options) : null,
      correct_answer: dto.correctAnswer,
      difficulty: dto.difficulty || 2,
      weight: dto.weight || 1,
    });
  }

  // Legacy endpoint for backward compatibility
  @Post()
  @ApiOperation({ summary: 'Submit practice session (legacy)' })
  async create(@Body() dto: any, @Request() req) {
    return this.practiceService.create(req.user.userId, dto);
  }
}
