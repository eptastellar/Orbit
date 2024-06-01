import { ApiProperty } from '@nestjs/swagger';
import { UserSchemaDto } from './UserSchema.dto';

export class AuthResponseDto {
  @ApiProperty()
  user_data: UserSchemaDto;

  @ApiProperty()
  jwt: string;
}
