import { FriendshipRequestDto, QrCodeResponseDto, UserSchemaDto } from '@/dto';
import { FriendshipRequest, QrCodeResponse, UserSchema } from '@/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { randomBytes } from 'crypto';
import { QrService } from './qr.service';

@ApiTags('qr')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Generate a QR code',
    schema: { $ref: getSchemaPath(QrCodeResponseDto) },
  })
  @ApiExtraModels(QrCodeResponseDto)
  async setQrCode(@Body() body: Body): Promise<QrCodeResponse> {
    const uid: string = body['uid'];
    const randomCode: string = randomBytes(16).toString('hex');
    const expireTime: number = await this.qrService.setRandomFriendCode(
      uid,
      randomCode,
    );

    const qrCodeResponse: QrCodeResponse = {
      random_code: randomCode,
      expire_time: expireTime,
    };
    return qrCodeResponse;
  }

  @Post()
  @ApiBody({
    schema: {
      $ref: getSchemaPath(FriendshipRequestDto),
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Create friendship with QR code',
    schema: { $ref: getSchemaPath(UserSchemaDto) },
  })
  @ApiExtraModels(FriendshipRequestDto, UserSchemaDto)
  async createFriendship(@Body() body: Body): Promise<UserSchema> {
    const uid: string = body['uid'];
    const friend_code: string = body['friend_code'];

    const ereq: FriendshipRequest = {
      friend_code: friend_code,
    };

    const userSchema: UserSchema = await this.qrService.findRandomFriendCode(
      uid,
      ereq.friend_code,
    );
    return userSchema;
  }
}
