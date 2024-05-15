import { All, Controller } from '@nestjs/common';
import { AppService } from '@/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @All()
  getStatus(): string {
    return this.appService.getStatus();
  }
}
