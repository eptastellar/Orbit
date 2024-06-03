import { ApiProperty } from '@nestjs/swagger';

export class LeafCommentsRequestDto {
  @ApiProperty()
  last_leaf_comment_id: string;

  @ApiProperty()
  post_id: string;
}
