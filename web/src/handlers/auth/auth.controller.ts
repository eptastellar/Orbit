import { ValidationService } from '@/common';
import { CoreService } from '@/common/services/core/core.service';
import {
  AuthResponse,
  SignUpRequest,
  SignUpValidateRequest,
  SuccessResponse,
  UserSchema,
} from '@/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor(private readonly authService: AuthService) {
    this.validationService = new ValidationService();
    this.coreService = new CoreService();
  }

  @Get('sign-in')
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

  @Post('sign-up')
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
