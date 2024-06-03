import { ApiProperty } from '@nestjs/swagger';

export class SupernovaResponseDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  oneway: string;
}
