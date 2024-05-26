import { QrCodeRequest, UserSchema } from '@/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get()
  async setQrCode(@Body() body: Body): Promise<QrCodeRequest> {
    const uid: string = body['uid'];
    const randomCode: string = randomBytes(16).toString('hex');
    const expireTime: number = await this.qrService.setRandomFriendCode(
      uid,
      randomCode,
    );

    const qrCodeRequest = {
      random_code: randomCode,
      expire_time: expireTime,
    };
    return qrCodeRequest;
  }

  @Post()
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
