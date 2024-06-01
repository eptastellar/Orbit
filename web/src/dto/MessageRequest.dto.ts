import { ApiProperty } from '@nestjs/swagger';

export class MessagesRequestDto {
  @ApiProperty()
  chat_id: string;

  @ApiProperty()
  last_message_id?: string;
}
