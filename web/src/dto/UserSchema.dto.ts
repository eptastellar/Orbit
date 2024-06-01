import { ApiProperty } from '@nestjs/swagger';

export class UserSchemaDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  pfp: string;

  @ApiProperty()
  bday?: number;

  @ApiProperty()
  interests?: string[];
}
