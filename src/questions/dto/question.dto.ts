import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ example: 'What is the time complexity of Array.sort()?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'O(n log n) - Most JavaScript engines use Timsort or Quicksort' })
  @IsString()
  answer: string;

  @ApiProperty({ example: 'DSA', required: false, enum: ['DSA', 'Frontend', 'Backend', 'Debugging', 'Architecture', 'DevOps'] })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'easy', enum: ['easy', 'medium', 'hard'] })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiProperty({ example: 'Array Methods' })
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiProperty({ example: ['Algorithms', 'Sorting'] })
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateQuestionDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  answer?: string;

  @ApiProperty({ required: false, enum: ['DSA', 'Frontend', 'Backend', 'Debugging', 'Architecture', 'DevOps'] })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false, enum: ['easy', 'medium', 'hard'] })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiProperty({ required: false })
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class QuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  answer: string;

  @ApiProperty()
  category: string | null;

  @ApiProperty()
  difficulty: string;

  @ApiProperty()
  topic: string | null;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  timesAsked: number;

  @ApiProperty()
  timesCorrect: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class PracticeQueryDto {
  @ApiProperty({ required: false, example: 10 })
  @IsNumber()
  @IsOptional()
  count?: number;

  @ApiProperty({ required: false, example: 'JavaScript' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false, example: 'easy', enum: ['easy', 'medium', 'hard'] })
  @IsString()
  @IsOptional()
  difficulty?: string;
}
