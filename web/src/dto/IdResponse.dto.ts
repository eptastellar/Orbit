import { ApiProperty } from '@nestjs/swagger';

export class IdResponseDto {
  @ApiProperty()
  id: string;
}
