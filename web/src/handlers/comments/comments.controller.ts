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
import { CommentsService } from './comments.service';

@Controller('c')
export class CommentsController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly commentsService: CommentsService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Post('leafs/:id')
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

    return idResponse;
  }

  @Delete(':id')
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
