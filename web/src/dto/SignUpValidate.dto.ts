import { ApiProperty } from '@nestjs/swagger';

export class SignUpValidateRequestDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  bday: number;
}
