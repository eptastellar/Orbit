import { ApiProperty } from '@nestjs/swagger';

export class SignUpRequestDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  interests: string[];

  @ApiProperty()
  bday: number;

  @ApiProperty()
  pfp?: string;
}
