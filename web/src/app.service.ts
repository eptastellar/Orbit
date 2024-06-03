import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): {
    uptime: number;
    platform: string;
    arch: string;
    node: string;
  } {
    return {
      uptime: process.uptime(),
      platform: process.platform,
      arch: process.arch,
      node: process.version,
    };
  }
}
