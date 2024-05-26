import { SuccessResponse } from '@/types';
import { Controller, Get } from '@nestjs/common';
import { CronService } from './cron.service';

@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Get('garbage-collector')
  async garbageCollector(): Promise<SuccessResponse> {
    const successResponse: SuccessResponse =
      await this.cronService.garbageCollector();
    return successResponse;
  }

  @Get('keep-alive-neo4j')
  async keepAliveNeo4j(): Promise<SuccessResponse> {
    const successResponse: SuccessResponse =
      await this.cronService.keepAliveNeo();
    return successResponse;
  }

  @Get('meteor')
  async meteor(): Promise<SuccessResponse> {
    const successResponse: SuccessResponse = await this.cronService.meteor();
    return successResponse;
  }
}
