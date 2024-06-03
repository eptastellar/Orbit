import { ApiProperty } from '@nestjs/swagger';

export class PostsRequestDto {
  @ApiProperty()
  last_post_id?: string;
}
