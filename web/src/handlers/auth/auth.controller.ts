import { Controller, Get, Res } from '@nestjs/common'; // Add this line
import { Response } from 'express';
import { AuthResponse } from 'src/types';

@Controller('auth')
export class AuthController {
  @Get('sign-in')
  async signIn(@Res() res: Response): Promise<AuthResponse> {
    try {
      const authorization: string = req.headers.authorization!;
      auth.accessGuard(authorization).then(async (uid: string) => {
        //send the firebase access token to create a session
        await valid.documentIdValidation(uid, 'users'); //check if the user is fully signed up even in firestore
        auth.newSession(uid).then((jwt: string) => {
          //create a multiaccess session using jwt
          core.getUserDataFromUid(uid).then((userSchema: UserSchema) => {
            const authResponse: AuthResponse = {
              user_data: { ...userSchema },
              jwt,
            };

            res.status(202).json({
              ...authResponse,
            });
          });
        });
      });
    } catch (error) {
      resError(res, error);
    }
  }
}
