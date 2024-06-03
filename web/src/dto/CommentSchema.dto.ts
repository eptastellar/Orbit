import { ApiProperty } from '@nestjs/swagger';
import { UserSchemaDto } from './UserSchema.dto';

export class CommentSchemaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  created_at: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  user_data: UserSchemaDto;
}
