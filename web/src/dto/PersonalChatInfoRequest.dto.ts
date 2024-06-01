import { ApiProperty } from '@nestjs/swagger';
import { UserSchemaDto } from './UserSchema.dto';

export class PersonalChatInfoResponseDto {
  @ApiProperty()
  user_data: UserSchemaDto;
}
