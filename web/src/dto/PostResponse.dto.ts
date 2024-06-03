import { ApiProperty } from '@nestjs/swagger';
import { UserSchemaDto } from './UserSchema.dto';

export class PostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_data: UserSchemaDto;

  @ApiProperty()
  created_at: number;

  @ApiProperty()
  likes: number;

  @ApiProperty()
  comments: number;

  @ApiProperty()
  is_liked: boolean;

  @ApiProperty()
  content?: string;

  @ApiProperty()
  text?: string;

  @ApiProperty()
  type?: string;
}
