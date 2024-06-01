import { NotificationResponseDto } from '@/dto';
import { NotificationResponse } from '@/types';
import { Body, Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get('all')
  @ApiResponse({
    status: 200,
    description: 'Get all notifications',
    schema: {
      items: {
        type: 'array',
        $ref: getSchemaPath(NotificationResponseDto),
      },
    },
  })
  @ApiExtraModels(NotificationResponseDto)
  @ApiBearerAuth('JWT_Session_Token')
  async getAllNotifications(
    @Body() body: Body,
  ): Promise<NotificationResponse[]> {
    const uid: string = body['uid'];
    const notifications: NotificationResponse[] =
      await this.notificationsService.getNotifications(uid, 'none');

    return notifications;
  }

  @Get('comments')
  @ApiResponse({
    status: 200,
    description: 'Get all comment notifications',
    schema: {
      items: {
        type: 'array',
        $ref: getSchemaPath(NotificationResponseDto),
      },
    },
  })
  @ApiExtraModels(NotificationResponseDto)
  @ApiBearerAuth('JWT_Session_Token')
  async getAllCommentsNotifications(
    @Body() body: Body,
  ): Promise<NotificationResponse[]> {
    const uid: string = body['uid'];
    const notifications: NotificationResponse[] =
      await this.notificationsService.getNotifications(uid, 'comment');

    return notifications;
  }

  @Get('likes')
  @ApiResponse({
    status: 200,
    description: 'Get all like notifications',
    schema: {
      items: {
        type: 'array',
        $ref: getSchemaPath(NotificationResponseDto),
      },
    },
  })
  @ApiExtraModels(NotificationResponseDto)
  @ApiBearerAuth('JWT_Session_Token')
  async getAllLikesNotifications(
    @Body() body: Body,
  ): Promise<NotificationResponse[]> {
    const uid: string = body['uid'];
    const notifications: NotificationResponse[] =
      await this.notificationsService.getNotifications(uid, 'like');

    return notifications;
  }
}
