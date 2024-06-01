import { ApiProperty } from '@nestjs/swagger';

export class NumberResponseDto {
  @ApiProperty()
  number: number;
}
