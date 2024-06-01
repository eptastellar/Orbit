import { ApiProperty } from '@nestjs/swagger';

export class SupernovaBindDto {
  @ApiProperty()
  response: string;
}
