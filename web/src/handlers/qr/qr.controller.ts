import { QrCodeRequest, UserSchema } from '@/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
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
    type: 'QrCodeRequest',
  })
  async setQrCode(@Body() body: Body): Promise<QrCodeRequest> {
    const uid: string = body['uid'];
    const randomCode: string = randomBytes(16).toString('hex');
    const expireTime: number = await this.qrService.setRandomFriendCode(
      uid,
      randomCode,
    );

    const qrCodeRequest: QrCodeRequest = {
      random_code: randomCode,
      expire_time: expireTime,
    };
    return qrCodeRequest;
  }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        friend_code: {
          type: 'string',
          description: 'Friend code in the Qr Code',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Create friendship with QR code',
    type: 'UserSchema',
  })
  async createFriendship(@Body() body: Body): Promise<UserSchema> {
    const uid: string = body['uid'];
    const randomCode: string = body['friend_code'];

    const userSchema: UserSchema = await this.qrService.findRandomFriendCode(
      uid,
      randomCode,
    );
    return userSchema;
  }
}
