import { ApiProperty } from '@nestjs/swagger';
import { CommentSchemaDto } from './CommentSchema.dto';
import { MessageSchemaDto } from './MessageSchema.dto';
import { PostResponseDto } from './PostResponse.dto';
import { RootCommentSchemaDto } from './RootCommentSchema.dto';

export class ContentFetchDto {
  @ApiProperty()
  content:
    | PostResponseDto[]
    | RootCommentSchemaDto[]
    | CommentSchemaDto[]
    | MessageSchemaDto[];

  @ApiProperty()
  last_doc_id: string;
}
