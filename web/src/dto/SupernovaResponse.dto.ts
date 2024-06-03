import { UserSchema } from '@/types';
import { ApiProperty } from '@nestjs/swagger';

export class SupernovaResponseDto {
  @ApiProperty()
  user: UserSchema;

  @ApiProperty()
  status: string;

  @ApiProperty()
  oneway: string;
}
