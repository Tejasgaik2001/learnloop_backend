import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, QuestionResponseDto, PracticeQueryDto } from './dto/question.dto';

@ApiTags('Questions')
@Controller('questions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new practice question' })
  @ApiResponse({ type: QuestionResponseDto })
  async create(
    @Request() req,
    @Body() dto: CreateQuestionDto,
  ): Promise<QuestionResponseDto> {
    const question = await this.questionsService.create(req.user.userId, dto);
    return this.mapToResponse(question);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user questions' })
  @ApiResponse({ type: [QuestionResponseDto] })
  async findAll(
    @Request() req,
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
  ): Promise<QuestionResponseDto[]> {
    const questions = await this.questionsService.findAll(req.user.userId, { category, difficulty });
    return questions.map(q => this.mapToResponse(q));
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all question categories' })
  async getCategories(@Request() req): Promise<string[]> {
    return this.questionsService.getCategories(req.user.userId);
  }

  @Get('practice')
  @ApiOperation({ summary: 'Get random questions for practice' })
  @ApiResponse({ type: [QuestionResponseDto] })
  async getPracticeQuestions(
    @Request() req,
    @Query() query: PracticeQueryDto,
  ): Promise<QuestionResponseDto[]> {
    const questions = await this.questionsService.getRandomQuestions(req.user.userId, {
      count: query.count,
      category: query.category,
      difficulty: query.difficulty,
    });
    return questions.map(q => this.mapToResponse(q));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single question by ID' })
  @ApiResponse({ type: QuestionResponseDto })
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<QuestionResponseDto> {
    const question = await this.questionsService.findOne(req.user.userId, id);
    return this.mapToResponse(question);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a question' })
  @ApiResponse({ type: QuestionResponseDto })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
  ): Promise<QuestionResponseDto> {
    const question = await this.questionsService.update(req.user.userId, id, dto);
    return this.mapToResponse(question);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a question' })
  @ApiResponse({ status: 204 })
  async remove(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    await this.questionsService.remove(req.user.userId, id);
  }

  @Post(':id/attempt')
  @ApiOperation({ summary: 'Record an attempt for a question' })
  async recordAttempt(
    @Request() req,
    @Param('id') id: string,
    @Body('isCorrect') isCorrect: boolean,
  ): Promise<void> {
    await this.questionsService.recordAttempt(req.user.userId, id, isCorrect);
  }

  private mapToResponse(question: any): QuestionResponseDto {
    return {
      id: question.id,
      userId: question.user_id,
      question: question.question,
      answer: question.answer,
      category: question.category,
      difficulty: question.difficulty,
      topic: question.topic,
      tags: question.tags,
      timesAsked: question.times_asked,
      timesCorrect: question.times_correct,
      createdAt: question.created_at.toISOString(),
      updatedAt: question.updated_at.toISOString(),
    };
  }
}
