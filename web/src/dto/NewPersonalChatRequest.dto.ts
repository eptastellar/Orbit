import { ApiProperty } from '@nestjs/swagger';

export class NewPersonalChatRequestDto {
  @ApiProperty()
  receiver_username: string;
}
