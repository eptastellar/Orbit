import { SuccessResponse } from '@/types';
import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CronService } from './cron.service';

@ApiTags('cron')
@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Get('garbage-collector')
  @ApiResponse({
    status: 200,
    description: 'Run garbage collector',
    type: 'SuccessResponse',
  })
  async garbageCollector(): Promise<SuccessResponse> {
    const successResponse: SuccessResponse =
      await this.cronService.garbageCollector();
    return successResponse;
  }

  @Get('keep-alive-neo4j')
  @ApiResponse({
    status: 200,
    description: 'Keep Neo4j database alive',
    type: 'SuccessResponse',
  })
  async keepAliveNeo4j(): Promise<SuccessResponse> {
    const successResponse: SuccessResponse =
      await this.cronService.keepAliveNeo();
    return successResponse;
  }

  @Get('meteor')
  @ApiResponse({
    status: 200,
    description: 'Execute meteor task',
    type: 'SuccessResponse',
  })
  async meteor(): Promise<SuccessResponse> {
    const successResponse: SuccessResponse = await this.cronService.meteor();
    return successResponse;
  }
}
