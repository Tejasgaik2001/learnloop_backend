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
}
