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
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('p')
export class PostsController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly postsService: PostsService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Get a post by ID',
    type: 'PostResponse',
  })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiBearerAuth('JWT Session Token')
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text_content: { type: 'string' },
        type: { type: 'string' },
        content: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Update a post by ID',
    type: 'IdResponse',
  })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiBearerAuth('JWT Session Token')
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
  @ApiResponse({
    status: 200,
    description: 'Delete a post by ID',
    type: 'IdResponse',
  })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiBearerAuth('JWT Session Token')
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text_content: { type: 'string' },
        type: { type: 'string' },
        content: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Create a new post',
    type: 'IdResponse',
  })
  @ApiBearerAuth('JWT Session Token')
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
