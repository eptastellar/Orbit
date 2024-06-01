import { ApiProperty } from '@nestjs/swagger';

export class LatestMessageSchemaDto {
  @ApiProperty()
  content: string;

  @ApiProperty()
  type: string;
}
