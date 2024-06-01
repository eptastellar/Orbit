import { Module } from '@nestjs/common';
import { SupernovaController } from './supernova.controller';
import { SupernovaService } from './supernova.service';

@Module({
  controllers: [SupernovaController],
  providers: [SupernovaService],
})
export class SupernovaModule {}
