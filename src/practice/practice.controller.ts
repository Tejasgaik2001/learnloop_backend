import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PracticeService } from './practice.service';
import { CreatePracticeDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Practice')
@Controller('practice')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PracticeController {
  constructor(private practiceService: PracticeService) {}

  @Post()
  @ApiOperation({ summary: 'Submit practice session' })
  async create(@Body() dto: CreatePracticeDto, @Request() req) {
    return this.practiceService.create(req.user.userId, dto);
  }
}
