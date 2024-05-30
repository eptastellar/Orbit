import { CoreService, ValidationService } from '@/common';
import {
  CommentUploadRequest,
  ContentFetch,
  DeleteCommentRequest,
  IdResponse,
  LeafCommentsRequest,
  RootCommentsRequest,
  SuccessResponse,
} from '@/types';
import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';

@ApiTags('comments')
@Controller('c')
export class CommentsController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly commentsService: CommentsService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Post('leafs/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        last_leaf_comment_id: { type: 'string' },
        post_id: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Get leaf comments',
    type: 'ContentFetch',
  })
  @ApiParam({ name: 'id', description: 'Root comment ID', type: 'string' })
  @ApiBearerAuth('JWT Session Token')
  async getLeafComments(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<ContentFetch> {
    const root_id: string = params['id'];
    const last_leaf_comment_id: string = body['last_leaf_comment_id'];
    const post_id: string = body['post_id'];

    const ereq: LeafCommentsRequest = {
      last_leaf_comment_id,
      post_id,
    };

    if (ereq.last_leaf_comment_id)
      await this.validationService.commentLeafIdValidation(
        ereq.last_leaf_comment_id,
        root_id,
        ereq.post_id,
      );

    await this.validationService.documentIdValidation(ereq.post_id, 'posts');
    await this.validationService.commentRootIdValidation(root_id, ereq.post_id);
    const contentFetch: ContentFetch =
      await this.commentsService.fetchLeafsComments(
        root_id,
        ereq.last_leaf_comment_id,
      );
    return contentFetch;
  }

  @Post('roots/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        last_root_comment_id: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Get root comments',
    type: 'ContentFetch',
  })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiBearerAuth('JWT Session Token')
  async getRootComments(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<ContentFetch> {
    const post_id: string = params['id'];
    const last_root_comment_id: string = body['last_root_comment_id'];

    const ereq: RootCommentsRequest = {
      last_root_comment_id,
    };

    if (ereq.last_root_comment_id)
      await this.validationService.commentRootIdValidation(
        ereq.last_root_comment_id,
        post_id,
      );

    await this.validationService.documentIdValidation(post_id, 'posts');
    const contentFetch: ContentFetch =
      await this.commentsService.fetchRootComments(
        post_id,
        ereq.last_root_comment_id,
      );

    return contentFetch;
  }

  @Post(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        root_id: { type: 'string' },
        content: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload a comment',
    type: 'IdResponse',
  })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiBearerAuth('JWT Session Token')
  async uploadComment(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<IdResponse> {
    const uid: string = body['uid'];
    const post_id: string = params['id'];
    const root_id: string = body['root_id'];
    const content: string = body['content'];

    const ereq: CommentUploadRequest = {
      root_id,
      content,
    };

    if (ereq.root_id)
      await this.validationService.commentRootIdValidation(
        ereq.root_id,
        post_id,
      );

    await this.validationService.documentIdValidation(post_id, 'posts');
    await this.validationService.contentValidation(ereq.content);
    const idResponse: IdResponse = await this.commentsService.newComment(
      uid,
      ereq.root_id,
      post_id,
      ereq.content,
    );

    const owner: string = await this.coreService.getOwner(post_id, 'posts');
    await this.coreService.addNotification(uid, owner, 'comment');

    return idResponse;
  }

  @Delete(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        root_id: { type: 'string' },
        comment_id: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Delete a comment',
    type: 'SuccessResponse',
  })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiBearerAuth('JWT Session Token')
  async deleteComment(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<SuccessResponse> {
    const uid: string = body['uid'];
    const post_id: string = params['id'];
    const root_id: string = body['root_id'];
    const comment_id: string = body['comment_id'];

    const ereq: DeleteCommentRequest = {
      root_id,
      comment_id,
    };

    await this.validationService.documentIdValidation(post_id, 'posts');

    if (ereq.root_id)
      await this.validationService.commentRootIdValidation(
        ereq.comment_id,
        post_id,
      );
    else
      await this.validationService.commentLeafIdValidation(
        ereq.comment_id,
        ereq.root_id as string,
        post_id,
      );

    await this.coreService.hasPermissionTo(uid, ereq.comment_id, 'comments');

    const successResponse: SuccessResponse =
      await this.commentsService.deleteComment(ereq.comment_id);

    return successResponse;
  }
}
