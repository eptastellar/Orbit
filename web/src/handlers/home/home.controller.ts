import { CoreService, ValidationService } from '@/common';
import { ContentFetch, NumberResponse, PostsRequest } from '@/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';

@ApiTags('home')
@Controller('home')
export class HomeController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly homeService: HomeService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Post('posts')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
        last_post_id: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Get posts for the home feed',
    type: 'ContentFetch',
  })
  @ApiBearerAuth('JWT Session Token')
  async getPosts(@Body() body: Body): Promise<ContentFetch> {
    const uid: string = body['uid'];
    const last_post_id: string = body['last_post_id'];

    const ereq: PostsRequest = {
      last_post_id,
    };

    if (ereq.last_post_id) {
      await this.validationService.documentIdValidation(
        ereq.last_post_id,
        'posts',
      );
    }

    const friendList: string[] = await this.coreService.getFriendList(uid);
    const contentFetch: ContentFetch = await this.coreService.fetchPosts(
      friendList,
      uid,
      ereq.last_post_id,
    );
    return contentFetch;
  }

  @Get('messages')
  @ApiResponse({
    status: 200,
    description: 'Get count of unread messages',
    type: 'NumberResponse',
  })
  @ApiBearerAuth('JWT Session Token')
  async getMessagesCount(@Body() body: Body): Promise<NumberResponse> {
    const uid: string = body['uid'];
    const numberResponse: NumberResponse =
      await this.homeService.getUnreadedMessagesCount(uid);
    return numberResponse;
  }
}
