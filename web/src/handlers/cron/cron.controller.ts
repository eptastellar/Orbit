import { SuccessResponseDto } from '@/dto';
import { SuccessResponse } from '@/types';
import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CronService } from './cron.service';

@ApiTags('cron')
@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Get('garbage-collector')
  @ApiResponse({
    status: 200,
    description: 'Run garbage collector',
    schema: { $ref: getSchemaPath(SuccessResponseDto) },
  })
  @ApiExtraModels(SuccessResponseDto)
  @ApiBearerAuth('Cron_Token')
  async garbageCollector(): Promise<SuccessResponse> {
    const successResponse: SuccessResponse =
      await this.cronService.garbageCollector();
    return successResponse;
  }

  @Get('keep-alive-neo4j')
  @ApiResponse({
    status: 200,
    description: 'Keep Neo4j database alive',
    schema: { $ref: getSchemaPath(SuccessResponseDto) },
  })
  @ApiExtraModels(SuccessResponseDto)
  @ApiBearerAuth('Cron_Token')
  async keepAliveNeo4j(): Promise<SuccessResponse> {
    const successResponse: SuccessResponse =
      await this.cronService.keepAliveNeo();
    return successResponse;
  }

  @Get('meteor')
  @ApiResponse({
    status: 200,
    description: 'Execute meteor task',
    schema: { $ref: getSchemaPath(SuccessResponseDto) },
  })
  @ApiExtraModels(SuccessResponseDto)
  @ApiBearerAuth('Cron_Token')
  async meteor(): Promise<SuccessResponse> {
    const successResponse: SuccessResponse = await this.cronService.meteor();
    return successResponse;
  }
}
