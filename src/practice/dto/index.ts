import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePracticeDto {
  @ApiProperty({ example: 'topic-uuid' })
  @IsString()
  topicId: string;

  @ApiProperty({ example: 'What is the difference between let and const?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'let can be reassigned, const cannot' })
  @IsString()
  answer: string;

  @ApiProperty({ example: 'correct', enum: ['correct', 'partial', 'incorrect'] })
  @IsString()
  @IsIn(['correct', 'partial', 'incorrect'])
  result: 'correct' | 'partial' | 'incorrect';
}
