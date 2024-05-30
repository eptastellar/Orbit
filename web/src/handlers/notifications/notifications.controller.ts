import { NotificationResponse } from '@/types';
import { Body, Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('all')
  @ApiResponse({
    status: 200,
    description: 'Get all notifications',
    type: 'NotificationResponse[]',
  })
  @ApiBearerAuth('JWT Session Token')
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
    type: 'NotificationResponse[]',
  })
  @ApiBearerAuth('JWT Session Token')
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
    type: 'NotificationResponse[]',
  })
  @ApiBearerAuth('JWT Session Token')
  async getAllLikesNotifications(
    @Body() body: Body,
  ): Promise<NotificationResponse[]> {
    const uid: string = body['uid'];
    const notifications: NotificationResponse[] =
      await this.notificationsService.getNotifications(uid, 'like');

    return notifications;
  }
}
