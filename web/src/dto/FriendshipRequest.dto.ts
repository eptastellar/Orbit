import { ApiProperty } from '@nestjs/swagger';

export class FriendshipRequestDto {
  @ApiProperty()
  friend_code: string;
}
