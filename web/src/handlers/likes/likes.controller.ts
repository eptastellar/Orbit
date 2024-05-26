import { ValidationService } from '@/common';
import { CoreService } from '@/common/services/core/core.service';
import { IdResponse } from '@/types';
import { Body, Controller, Param, Post } from '@nestjs/common';
import { LikesService } from './likes.service';

@Controller('l')
export class LikesController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly likesService: LikesService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Post(':id')
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
    return idResponse;
  }
}
