import { ValidationService } from '@/common';
import { IdResponseDto, UploadMessageRequestDto } from '@/dto';
import { IdResponse, UploadMessageRequest } from '@/types';
import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@Controller('m')
export class MessagesController {
  private validationService: ValidationService;

  constructor(private readonly messagesService: MessagesService) {
    this.validationService = new ValidationService();
  }

  @Post('personal/:id')
  @ApiBody({
    schema: {
      $ref: getSchemaPath(UploadMessageRequestDto),
    },
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Get messages from a personal chat',
    schema: { $ref: getSchemaPath(IdResponseDto) },
  })
  @ApiExtraModels(UploadMessageRequestDto, IdResponseDto)
  @ApiBearerAuth('JWT_Session_Token')
  async getPersonalChatMessages(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<IdResponse> {
    const uid: string = body['uid'];
    const chat_id: string = params['id'];
    const text_content: string = body['text_content'];
    const type: string = body['type'];
    const content: string = body['content'];

    const ereq: UploadMessageRequest = {
      text_content,
      content,
      type,
    };

    await this.validationService.contentValidation(
      ereq.text_content,
      ereq.content,
      ereq.type,
    );
    await this.validationService.documentIdValidation(
      chat_id,
      'personal-chats',
    );
    const members: string[] = await this.messagesService.getMembersFromChatId(
      uid,
      chat_id,
    );
    const idResponse: IdResponse = await this.messagesService.newChatMessage(
      uid,
      chat_id,
      members,
      false,
      ereq.text_content,
      ereq.type,
      ereq.content,
    );
    return idResponse;
  }
}
