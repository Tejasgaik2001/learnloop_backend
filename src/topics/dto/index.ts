import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({ example: 'React useEffect Hook' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Programming' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'useEffect is a React Hook...' })
  @IsString()
  notes: string;

  @ApiPropertyOptional({ example: 'useEffect(() => {}, [])' })
  @IsString()
  @IsOptional()
  codeSnippet?: string;

  @ApiPropertyOptional({ example: 'https://leetcode.com/problems/example' })
  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional({ example: 'coding', enum: ['concept', 'coding', 'debugging', 'interview', 'theory'] })
  @IsString()
  @IsOptional()
  problemType?: string;

  @ApiPropertyOptional({ example: 'Closure allows functions to access outer scope variables...' })
  @IsString()
  @IsOptional()
  keyConcept?: string;

  @ApiPropertyOptional({ example: 'The expected output is...' })
  @IsString()
  @IsOptional()
  expectedOutput?: string;

  @ApiPropertyOptional({ example: 'I initially forgot to include the dependency array...' })
  @IsString()
  @IsOptional()
  mistake?: string;

  @ApiPropertyOptional({ example: 'Medium', enum: ['Easy', 'Medium', 'Hard'] })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({ example: 'auto', enum: ['auto', 'custom'] })
  @IsString()
  @IsOptional()
  revisionPattern?: string;
}

export class UpdateTopicDto {
  @ApiPropertyOptional({ example: 'React useEffect Hook' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Programming' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'useEffect is a React Hook...' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'useEffect(() => {}, [])' })
  @IsString()
  @IsOptional()
  codeSnippet?: string;

  @ApiPropertyOptional({ example: 'https://leetcode.com/problems/example' })
  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional({ example: 'coding', enum: ['concept', 'coding', 'debugging', 'interview', 'theory'] })
  @IsString()
  @IsOptional()
  problemType?: string;

  @ApiPropertyOptional({ example: 'Closure allows functions to access outer scope variables...' })
  @IsString()
  @IsOptional()
  keyConcept?: string;

  @ApiPropertyOptional({ example: 'The expected output is...' })
  @IsString()
  @IsOptional()
  expectedOutput?: string;

  @ApiPropertyOptional({ example: 'I initially forgot to include the dependency array...' })
  @IsString()
  @IsOptional()
  mistake?: string;

  @ApiPropertyOptional({ example: 'Medium', enum: ['Easy', 'Medium', 'Hard'] })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({ example: 'auto', enum: ['auto', 'custom'] })
  @IsString()
  @IsOptional()
  revisionPattern?: string;
}
