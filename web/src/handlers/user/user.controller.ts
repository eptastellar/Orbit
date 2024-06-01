import { CoreService, ValidationService } from '@/common';
import {
  ContentFetchDto,
  IdResponseDto,
  PostsRequestDto,
  SuccessResponseDto,
  UserResponseDto,
  UserSchemaDto,
} from '@/dto';
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('u')
export class UserController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly userService: UserService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Get(':username')
  @ApiResponse({
    status: 200,
    description: 'Get user information by username',
    schema: { $ref: getSchemaPath(UserResponseDto) },
  })
  @ApiParam({ name: 'username', description: 'Username', type: 'string' })
  @ApiExtraModels(UserResponseDto)
  @ApiBearerAuth('JWT_Session_Token')
  async getUserInfo(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<UserResponse> {
    const tokenUid: string = body['uid'];
    const username: string = params['username'];

    const uid: string = await this.coreService.getUidFromUserData(username);
    await this.coreService.areFriends(tokenUid, uid);
    const userSchema: UserSchema =
      await this.coreService.getUserDataFromUid(uid);
    const posts: number = await this.coreService.counter(uid, 'posts', 'owner');
    const friends: number = await this.userService.getFriendsCount(uid);
    const meteors: number = await this.userService.getMeteorCount();

    const userResponse: UserResponse = {
      personal: tokenUid === uid,
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
  @ApiBody({
    schema: {
      $ref: getSchemaPath(PostsRequestDto),
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Get user posts by username',
    schema: { $ref: getSchemaPath(ContentFetchDto) },
  })
  @ApiParam({ name: 'username', description: 'Username', type: 'string' })
  @ApiExtraModels(ContentFetchDto, PostsRequestDto)
  @ApiBearerAuth('JWT_Session_Token')
  async getUserPosts(
    @Body() body: Body,
    @Param() params: any,
  ): Promise<ContentFetch> {
    const tokenUid: string = body['uid'];
    const username: string = params['username'];
    const last_post_id: string = body['last_post_id'];

    const ereq: PostsRequest = {
      last_post_id,
    };

    if (ereq.last_post_id)
      await this.validationService.documentIdValidation(
        ereq.last_post_id,
        'posts',
      );

    const uid: string = await this.coreService.getUidFromUserData(username);
    await this.coreService.areFriends(tokenUid, uid);
    const contentFetch: ContentFetch = await this.coreService.fetchPosts(
      [uid],
      uid,
      ereq.last_post_id,
    );
    return contentFetch;
  }

  @Get('settings')
  @ApiResponse({
    status: 200,
    description: 'Get user settings information',
    schema: { $ref: getSchemaPath(UserSchemaDto) },
  })
  @ApiExtraModels(UserSchemaDto)
  @ApiBearerAuth('JWT_Session_Token')
  async getUserSettingsInfo(@Body() body: Body): Promise<UserSchema> {
    const uid: string = body['uid'];
    const userSchema: UserSchema =
      await this.coreService.getUserDataFromUid(uid);
    return userSchema;
  }

  @Patch('settings')
  @ApiBody({
    schema: {
      $ref: getSchemaPath(UserSchemaDto),
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Update user settings information',
    schema: { $ref: getSchemaPath(IdResponseDto) },
  })
  @ApiExtraModels(IdResponseDto, UserSchemaDto)
  @ApiBearerAuth('JWT_Session_Token')
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
  @ApiResponse({
    status: 200,
    description: 'Delete user and associated data',
    schema: { $ref: getSchemaPath(SuccessResponseDto) },
  })
  @ApiExtraModels(SuccessResponseDto)
  @ApiBearerAuth('JWT_Session_Token')
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
