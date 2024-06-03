import { ApiProperty } from '@nestjs/swagger';

export class QrCodeResponseDto {
  @ApiProperty()
  random_code: string;

  @ApiProperty()
  expire_time: number;
}
