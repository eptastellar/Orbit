import { CoreService, ValidationService } from '@/common';
import {
  AuthResponse,
  SignUpRequest,
  SignUpValidateRequest,
  SuccessResponse,
  UserSchema,
} from '@/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly authService: AuthService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Get('sign-in')
  @ApiResponse({
    status: 200,
    description: 'User sign-in',
    type: 'AuthResponse',
  })
  @ApiBearerAuth('Firebase Access Token')
  async signIn(@Body() body: Body): Promise<AuthResponse> {
    const uid: string = body['uid'];
    await this.validationService.documentIdValidation(uid, 'users'); //check if the user is fully signed up even in firestore
    const jwt: string = await this.authService.newSession(uid); //create a multiaccess session using jwt
    const userSchema: UserSchema =
      await this.coreService.getUserDataFromUid(uid);

    const authResponse: AuthResponse = {
      user_data: { ...userSchema },
      jwt,
    };

    return authResponse;
  }

  @Get('log-out')
  @ApiResponse({
    status: 200,
    description: 'User log-out',
    type: 'SuccessResponse',
  })
  async logOut(@Body() body: Body): Promise<SuccessResponse> {
    const uid: string = body['uid'];
    const successResponse: SuccessResponse = await this.authService.logOut(uid);
    return successResponse;
  }

  @Post('sign-up')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        interests: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of interests',
        },
        bday: { type: 'number', description: 'Unix timestamp birthday' },
        pfp: { type: 'string', description: 'Profile picture URL' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User sign-up',
    type: 'AuthResponse',
  })
  @ApiBearerAuth('Firebase Access Token')
  async signUp(@Body() body: Body): Promise<AuthResponse> {
    const uid: string = body['uid'];
    const username: string = body['username'];
    const interests: string[] = body['interests'];
    const bday: number = body['bday'];
    const pfp: string = body['pfp'];

    const ereq: SignUpRequest = {
      username,
      interests,
      bday,
      pfp,
    };

    await this.validationService.usernameValidation(ereq.username);
    await this.validationService.birthdateValidation(ereq.bday);
    await this.validationService.interestsValidation(ereq.interests);
    const userSchema: UserSchema = await this.authService.newUserDocument(
      uid,
      ereq.username,
      ereq.bday,
      ereq?.pfp,
    ); //create a new doc in /users
    await this.authService.newUserNode(uid, ereq.interests); //create a new node in neo4j
    const jwt: string = await this.authService.newSession(uid); //return the session jwt and the user for the frontend side
    const authResponse: AuthResponse = {
      jwt,
      user_data: { ...userSchema },
    };

    return authResponse;
  }

  @Post('sign-up/validate')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        bday: { type: 'number', description: 'Unix timestamp birthday' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User sign-up validation',
    type: 'SuccessResponse',
  })
  async signUpValidate(@Body() body: Body): Promise<SuccessResponse> {
    const username: string = body['username'];
    const bday: number = body['bday'];

    const ereq: SignUpValidateRequest = {
      username,
      bday,
    };

    await this.validationService.usernameValidation(ereq.username);
    await this.validationService.birthdateValidation(ereq.bday);
    const successResponse: SuccessResponse = {
      success: true,
    };

    return successResponse;
  }
}
