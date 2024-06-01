import { CoreService, ValidationService } from '@/common';
import { IdResponseDto } from '@/dto';
import { IdResponse } from '@/types';
import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { LikesService } from './likes.service';

@ApiTags('likes')
@Controller('l')
export class LikesController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly likesService: LikesService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Post(':id')
  @ApiResponse({
    status: 200,
    description: 'Manage a like for a post',
    schema: { $ref: getSchemaPath(IdResponseDto) },
  })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiExtraModels(IdResponseDto)
  @ApiBearerAuth('JWT_Session_Token')
  async manageLike(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<IdResponse> {
    const tokenUid: string = body['uid'];
    const post_id: string = params['id'];

    await this.validationService.documentIdValidation(post_id, 'posts');
    const ownerUid: string = await this.coreService.getOwner(post_id, 'posts');
    await this.coreService.areFriends(tokenUid, ownerUid);
    const idResponse: IdResponse = await this.likesService.updateLike(
      post_id,
      tokenUid,
    );

    await this.coreService.addNotification(tokenUid, ownerUid, 'like');
    return idResponse;
  }
}
