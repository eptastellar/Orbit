import { ApiProperty } from '@nestjs/swagger';

export class RootCommentsRequestDto {
  @ApiProperty()
  last_root_comment_id: string;
}
