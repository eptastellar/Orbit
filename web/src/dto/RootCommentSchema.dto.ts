import { ApiProperty } from '@nestjs/swagger';
import { CommentSchemaDto } from './CommentSchema.dto';

export class RootCommentSchemaDto {
  @ApiProperty()
  comment: CommentSchemaDto;

  @ApiProperty()
  leafs: number;
}
