import { ApiProperty } from '@nestjs/swagger';

export class CommentUploadRequestDto {
  @ApiProperty()
  root_id: string;

  @ApiProperty()
  content: string;
}
