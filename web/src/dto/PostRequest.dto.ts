import { ApiProperty } from '@nestjs/swagger';

export class PostRequestDto {
  @ApiProperty()
  text_content?: string;

  @ApiProperty()
  type?: string;

  @ApiProperty()
  content?: string;
}
