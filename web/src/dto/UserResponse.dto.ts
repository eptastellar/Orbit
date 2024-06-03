import { ApiProperty } from '@nestjs/swagger';
import { UserSchemaDto } from './UserSchema.dto';

export class UserResponseDto {
  @ApiProperty()
  personal: boolean;

  @ApiProperty()
  user_data: UserSchemaDto;

  @ApiProperty()
  counters: {
    posts: number;
    friends: number;
    meteors: number;
  };
}
