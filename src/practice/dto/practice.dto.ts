import { IsString, IsIn, IsUUID, IsNumber, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum QuestionType {
  MCQ = 'mcq',
  SHORT_ANSWER = 'short_answer',
}

// Answer submission DTO
export class AnswerSubmissionDto {
  @ApiProperty({ example: 'question-uuid' })
  @IsUUID()
  questionId: string;

  @ApiProperty({ example: 'selected answer or typed response' })
  @IsString()
  selectedAnswer: string;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsNumber()
  timeTaken?: number;
}

// Submit practice session DTO
export class SubmitPracticeDto {
  @ApiProperty({ type: [AnswerSubmissionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerSubmissionDto)
  answers: AnswerSubmissionDto[];
}

// Practice result response
export class PracticeResultDto {
  @ApiProperty()
  score: number;

  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  correctCount: number;

  @ApiProperty()
  incorrectCount: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty({ type: [String] })
  weakAreas: string[];
}

// Question response DTO
export class QuestionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  topicId: string;

  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @ApiProperty()
  question: string;

  @ApiPropertyOptional({ type: [String] })
  options?: string[];

  @ApiProperty()
  difficulty: number;

  @ApiProperty()
  topicTitle: string;
}

// Get random questions query DTO
export class GetRandomQuestionsDto {
  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}

// Create question DTO (for admin/seeding)
export class CreateQuestionDto {
  @ApiProperty({ example: 'topic-uuid' })
  @IsUUID()
  topicId: string;

  @ApiProperty({ enum: QuestionType })
  @IsIn(['mcq', 'short_answer'])
  type: QuestionType;

  @ApiProperty({ example: 'What is the output of 2 + 2?' })
  @IsString()
  question: string;

  @ApiPropertyOptional({ example: ['3', '4', '5', '6'] })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiProperty({ example: '4' })
  @IsString()
  correctAnswer: string;

  @ApiPropertyOptional({ example: 2, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  difficulty?: number = 2;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  weight?: number = 1;
}

// Practice session response
export class PracticeSessionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  completedAt: Date;
}

// Attempt response
export class PracticeAttemptDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  questionId: string;

  @ApiProperty()
  selectedAnswer: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty()
  timeTaken: number;
}
