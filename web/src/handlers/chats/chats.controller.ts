import { ValidationService } from '@/common';
import { CoreService } from '@/common/services/core/core.service';
import {
  ChatsResponse,
  ContentFetch,
  IdResponse,
  MessagesRequest,
  NewPersonalChatRequest,
  PersonalChatInfoResponse,
} from '@/types';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly chatsService: ChatsService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Get('personal/:id')
  async getPersonalChatInfo(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<PersonalChatInfoResponse> {
    const uid: string = body['uid'];
    const chatId: string = params['id'];

    await this.validationService.documentIdValidation(chatId, 'personal-chats');
    const personalChatInfoResponse: PersonalChatInfoResponse =
      await this.chatsService.getPersonalChatInfo(uid, chatId);
    return personalChatInfoResponse;
  }

  @Get('personal')
  async getPersonalChats(@Body() body: Body): Promise<ChatsResponse> {
    const uid: string = body['uid'];

    const chatsResponse: ChatsResponse =
      await this.chatsService.getPersonalChats(uid);
    return chatsResponse;
  }

  @Post('personal/m')
  async getPersonalChatMessages(@Body() body: Body): Promise<ContentFetch> {
    const uid: string = body['uid'];
    const chat_id: string = body['chat_id'];
    const last_message_id: string = body['last_message_id'];

    const ereq: MessagesRequest = {
      chat_id,
      last_message_id,
    };

    if (ereq.last_message_id)
      await this.validationService.documentIdValidation(
        ereq.last_message_id,
        'messages',
      );

    await this.validationService.documentIdValidation(
      ereq.chat_id,
      'personal-chats',
    );
    const contentFetch: ContentFetch =
      await this.chatsService.fetchChatMessages(
        uid,
        ereq.chat_id,
        false,
        ereq.last_message_id,
      );
    return contentFetch;
  }

  @Post('personal/new')
  async newPersonalChat(@Body() body: Body): Promise<IdResponse> {
    const uid: string = body['uid'];
    const receiver_username: string = body['receiver_username'];

    const ereq: NewPersonalChatRequest = {
      receiver_username,
    };

    await this.validationService.membersValidation(uid, [receiver_username]);
    const receiverUid: string = await this.coreService.getUidFromUserData(
      ereq.receiver_username,
    );
    const idResponse: IdResponse = await this.chatsService.newPersonalChat(
      uid,
      receiverUid,
    );
    return idResponse;
  }
}
