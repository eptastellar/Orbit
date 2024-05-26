import { Module } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';

@Module({
  providers: [InterestsService],
  controllers: [InterestsController],
})
export class InterestsModule {}
