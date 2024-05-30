import { InterestsResponse } from '@/types';
import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { InterestsService } from './interests.service';

@ApiTags('interests')
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get list of interests',
    type: 'InterestsResponse',
  })
  async getInterests(): Promise<InterestsResponse> {
    return this.interestsService.getInterests();
  }
}
