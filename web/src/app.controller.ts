import { AppService } from '@/app.service';
import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        uptime: { type: 'number', description: 'Uptime in seconds' },
        platform: { type: 'string', description: 'Operating System' },
        arch: { type: 'string', description: 'CPU Architecture' },
        node: { type: 'string', description: 'Node.js version' },
      },
    },
  })
  getStatus(): {
    uptime: number;
    platform: string;
    arch: string;
    node: string;
  } {
    return this.appService.getStatus();
  }
}
