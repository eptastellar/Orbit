import { CoreService, ValidationService } from '@/common';
import {
  ContentFetch,
  IdResponse,
  PostsRequest,
  SuccessResponse,
  UserResponse,
  UserSchema,
} from '@/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('u')
export class UserController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly userService: UserService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Get(':username')
  async getUserInfo(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<UserResponse> {
    const tokenUid: string = body['uid'];
    const username: string = params['username'];

    const uid: string = await this.coreService.getUidFromUserData(username); //also validate the username
    await this.coreService.areFriends(tokenUid, uid); //if they are not friends it will reject an error
    const userSchema: UserSchema =
      await this.coreService.getUserDataFromUid(uid);
    const posts: number = await this.coreService.counter(uid, 'posts', 'owner');
    const friends: number = await this.userService.getFriendsCount(uid);
    const meteors: number = await this.userService.getMeteorCount();

    const userResponse: UserResponse = {
      personal: tokenUid === uid, //check if is the user personal profile
      user_data: { ...userSchema },
      counters: {
        posts: posts,
        friends: friends,
        meteors: meteors,
      },
    };
    return userResponse;
  }

  @Post('posts/:username')
  async getUserPosts(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<ContentFetch> {
    const tokenUid: string = body['uid'];
    const username: string = params['username'];
    const last_post_id: string = body['last_post_id']; //retrieve the last fetched document

    const ereq: PostsRequest = {
      last_post_id,
    };

    if (ereq.last_post_id)
      await this.validationService.documentIdValidation(
        ereq.last_post_id,
        'posts',
      );

    const uid: string = await this.coreService.getUidFromUserData(username); //get the uid from the username, also validate the username
    await this.coreService.areFriends(tokenUid, uid);
    const contentFetch: ContentFetch = await this.coreService.fetchPosts(
      [uid],
      uid,
      ereq.last_post_id,
    );
    return contentFetch;
  }

  @Get('settings')
  async getUserSettingsInfo(@Body() body: Body): Promise<UserSchema> {
    const uid: string = body['uid'];

    const userSchema: UserSchema =
      await this.coreService.getUserDataFromUid(uid);
    return userSchema;
  }

  @Patch('settings')
  async fixUserSettingsInfo(@Body() body: Body): Promise<IdResponse> {
    const uid: string = body['uid'];
    const interests: string[] = body['interests'];
    const username: string = body['username'];
    const name: string = body['name'];
    const pfp: string = body['pfp'];

    const ereq: UserSchema = {
      username,
      name,
      pfp,
      interests,
    };

    await this.validationService.usernameValidation(ereq.username);
    await this.validationService.interestsValidation(ereq.interests!);
    await this.validationService.mediaValidation(pfp);
    const idResponse: IdResponse = await this.userService.updateUserInfo(
      uid,
      ereq,
    );
    return idResponse;
  }

  @Delete('settings')
  async deleteUser(@Body() body: Body): Promise<SuccessResponse> {
    const uid: string = body['uid'];
    await this.userService.deleteUser(uid);
    await this.coreService.removeBatch('posts', uid);
    await this.coreService.removeBatch('comments', uid);

    const successResponse: SuccessResponse = {
      success: true,
    };
    return successResponse;
  }
}
