import { ApiProperty } from '@nestjs/swagger';

export class SupernovaParamsDto {
  @ApiProperty()
  username: string;
  accepted: boolean;
  status: string;
  oneway: string;
}
