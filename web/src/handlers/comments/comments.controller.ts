import { CoreService, ValidationService } from '@/common';
import {
  CommentUploadRequestDto,
  ContentFetchDto,
  IdResponseDto,
  LeafCommentsRequestDto,
  RootCommentsRequestDto,
  SuccessResponseDto,
} from '@/dto';
import {
  CommentUploadRequest,
  ContentFetch,
  IdResponse,
  LeafCommentsRequest,
  RootCommentsRequest,
  SuccessResponse,
} from '@/types';
import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
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
      $ref: getSchemaPath(LeafCommentsRequestDto),
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Get leaf comments',
    schema: { $ref: getSchemaPath(ContentFetchDto) },
  })
  @ApiParam({ name: 'id', description: 'Root comment ID', type: 'string' })
  @ApiExtraModels(ContentFetchDto, LeafCommentsRequestDto)
  @ApiBearerAuth('JWT_Session_Token')
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
      $ref: getSchemaPath(RootCommentsRequestDto),
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Get root comments',
    schema: {
      $ref: getSchemaPath(ContentFetchDto),
    },
  })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiExtraModels(ContentFetchDto, RootCommentsRequestDto)
  @ApiBearerAuth('JWT_Session_Token')
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
      $ref: getSchemaPath(CommentUploadRequestDto),
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload a comment',
    schema: { $ref: getSchemaPath(IdResponseDto) },
  })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiExtraModels(CommentUploadRequestDto, IdResponseDto)
  @ApiBearerAuth('JWT_Session_Token')
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

  @Delete(':post_id/:comment_id/:root_id')
  @ApiResponse({
    status: 200,
    description: 'Delete a comment',
    schema: { $ref: getSchemaPath(SuccessResponseDto) },
  })
  @ApiParam({ name: 'post_id', description: 'Post ID', type: 'string' })
  @ApiParam({ name: 'root_id', description: 'Root Comment ID', type: 'string' })
  @ApiParam({ name: 'comment_id', description: 'Comment ID', type: 'string' })
  @ApiExtraModels(SuccessResponseDto)
  @ApiBearerAuth('JWT_Session_Token')
  async deleteComment(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<SuccessResponse> {
    const uid: string = body['uid'];
    const post_id: string = params['post_id'];
    const root_id: string = params['root_id'];
    const comment_id: string = params['comment_id'];

    await this.validationService.documentIdValidation(post_id, 'posts');

    if (root_id)
      await this.validationService.commentRootIdValidation(comment_id, post_id);
    else
      await this.validationService.commentLeafIdValidation(
        comment_id,
        root_id,
        post_id,
      );

    await this.coreService.hasPermissionTo(uid, comment_id, 'comments');

    const successResponse: SuccessResponse =
      await this.commentsService.deleteComment(comment_id);

    return successResponse;
  }
}
