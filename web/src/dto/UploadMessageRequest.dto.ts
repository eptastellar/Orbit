import { ApiProperty } from '@nestjs/swagger';

export class UploadMessageRequestDto {
  @ApiProperty()
  text_content: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  content: string;
}
