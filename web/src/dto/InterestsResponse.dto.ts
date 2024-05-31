import { ApiProperty } from '@nestjs/swagger';

export class InterestsResponseDto {
  @ApiProperty()
  interests: string[];
}
