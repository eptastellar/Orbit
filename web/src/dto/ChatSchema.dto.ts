import { ApiProperty } from '@nestjs/swagger';
import { LatestMessageSchemaDto } from './LatestMessageSchema.dto';

export class ChatSchemaDto {
  @ApiProperty()
  chat_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  pfp: string;

  @ApiProperty()
  bday?: boolean;

  @ApiProperty()
  latest_message?: LatestMessageSchemaDto;

  @ApiProperty()
  unreaded_messages?: number;
}
