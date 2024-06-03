import { InterestsResponseDto } from '@/dto';
import { InterestsResponse } from '@/types';
import { Controller, Get } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { InterestsService } from './interests.service';

@ApiTags('interests')
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get list of interests',
    schema: { $ref: getSchemaPath(InterestsResponseDto) },
  })
  @ApiExtraModels(InterestsResponseDto)
  async getInterests(): Promise<InterestsResponse> {
    return this.interestsService.getInterests();
  }
}
