import { InterestsResponse } from '@/types';
import { Controller, Get } from '@nestjs/common';
import { InterestsService } from './interests.service';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) { }

  @Get()
  async getInterests(): Promise<InterestsResponse> {
    return this.interestsService.getInterests();
  }
}
