import { ApiProperty } from '@nestjs/swagger';
import { ChatSchemaDto } from './ChatSchema.dto';

export class ChatsResponseDto {
  @ApiProperty()
  chats: ChatSchemaDto[];
}
