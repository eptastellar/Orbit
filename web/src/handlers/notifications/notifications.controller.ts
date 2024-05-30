import { CoreService } from '@/common';
import { NotificationResponse } from '@/types';
import { Body, Controller, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  private coreService: CoreService;

  constructor(private readonly notificationsService: NotificationsService) {
    this.coreService = new CoreService();
  }

  @Get('all')
  async getAllNotifications(
    @Body() body: Body,
  ): Promise<NotificationResponse[]> {
    const uid: string = body['uid'];
    const notifications: NotificationResponse[] =
      await this.notificationsService.getNotifications(uid, 'none');

    return notifications;
  }

  @Get('comments')
  async getAllCommentsNotifications(
    @Body() body: Body,
  ): Promise<NotificationResponse[]> {
    const uid: string = body['uid'];
    const notifications: NotificationResponse[] =
      await this.notificationsService.getNotifications(uid, 'comment');

    return notifications;
  }

  @Get('likes')
  async getAllLikesNotifications(
    @Body() body: Body,
  ): Promise<NotificationResponse[]> {
    const uid: string = body['uid'];
    const notifications: NotificationResponse[] =
      await this.notificationsService.getNotifications(uid, 'like');

    return notifications;
  }
}
