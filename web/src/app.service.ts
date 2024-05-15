import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): any {
    return {
      uptime: process.uptime(),
      platform: process.platform,
      arch: process.arch,
      node: process.version,
    };
  }
}
