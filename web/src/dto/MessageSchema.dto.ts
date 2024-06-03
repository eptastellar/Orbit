import { ApiProperty } from '@nestjs/swagger';

export class MessageSchemaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  personal: boolean;

  @ApiProperty()
  created_at: number;

  @ApiProperty()
  opened?: boolean;

  @ApiProperty()
  text?: string;

  @ApiProperty()
  content?: string;

  @ApiProperty()
  type?: string;

  @ApiProperty()
  pfp?: string;

  @ApiProperty()
  username?: string;
}
