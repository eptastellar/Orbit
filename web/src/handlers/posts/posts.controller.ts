import { CoreService, ValidationService } from '@/common';
import { IdResponse, PostRequest, PostResponse } from '@/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('p')
export class PostsController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly postsService: PostsService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Get(':id')
  async getPost(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<PostResponse> {
    const uid: string = body['uid'];
    const post_id: string = params['id'];

    await this.validationService.documentIdValidation(post_id, 'posts');
    const ownerUid: string = await this.coreService.getOwner(post_id, 'posts');
    await this.coreService.areFriends(uid, ownerUid);
    const postResponse: PostResponse = await this.postsService.getPost(
      uid,
      post_id,
    );
    return postResponse;
  }

  @Patch(':id')
  async fixPost(@Body() body: Body, @Param() params: any): Promise<IdResponse> {
    const uid: string = body['uid'];
    const post_id: string = params['id'];
    const text_content: string = body['text_content'];
    const type: string = body['type'];
    const content: string = body['content'];

    const ereq: PostRequest = {
      text_content,
      type,
      content,
    };

    await this.validationService.contentValidation(
      ereq.text_content,
      ereq.content,
      ereq.type,
    );
    await this.validationService.documentIdValidation(post_id, 'posts');
    await this.coreService.hasPermissionTo(uid, post_id, 'posts');
    const idResponse: IdResponse = await this.postsService.updatePost(
      post_id,
      ereq.text_content,
      ereq.content,
      ereq.type,
    );
    return idResponse;
  }

  @Delete(':id')
  async deletePost(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<IdResponse> {
    const uid: string = body['uid'];
    const post_id: string = params['id'];

    await this.validationService.documentIdValidation(post_id, 'posts');
    await this.coreService.hasPermissionTo(uid, post_id, 'posts');
    const idResponse: IdResponse = await this.coreService.delete(
      post_id,
      'posts',
    );
    return idResponse;
  }

  @Post()
  async uploadPost(@Body() body: Body): Promise<IdResponse> {
    const uid: string = body['uid'];
    const text_content: string = body['text_content'];
    const type: string = body['type'];
    const content: string = body['content'];

    const ereq: PostRequest = {
      text_content,
      content,
      type,
    };

    await this.validationService.contentValidation(
      ereq.text_content,
      ereq.content,
      ereq.type,
    );
    const idResponse: IdResponse = await this.postsService.newPost(
      uid,
      ereq.text_content,
      ereq.type,
      ereq.content,
    );
    return idResponse;
  }
}
