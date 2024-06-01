import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty()
  notifier: string;

  @ApiProperty()
  type: string;
}
