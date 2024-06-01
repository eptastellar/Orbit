import { ErrorsService } from '@/common';
import { FirebaseModule } from '@/config';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Auth } from 'firebase-admin/lib/auth/auth';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

@Injectable()
export class AccessMiddleware implements NestMiddleware {
  private auth: Auth;
  private error: ErrorsService;

  constructor() {
    this.auth = new FirebaseModule().getAuth();
    this.error = new ErrorsService();
  }

  async use(req: any, res: any, next: () => void) {
    try {
      console.log('access middleware');

      const authorization: string = req.headers.authorization; //get the authorization header

      if (authorization) {
        const jwt: string = authorization.split('Bearer ')[1]; //remove bearer from the authentication param

        const decodedJwt: DecodedIdToken = await this.auth.verifyIdToken(jwt); //verify token using firebase, it also check if the token is expired

        if (decodedJwt.email_verified) {
          req.body.uid = decodedJwt.uid; //save the user id in the request body

          next();
        } else return res.send(this.error.e('auth/email-not-verified'));
      } else return res.send(this.error.e('auth/email-not-verified'));
    } catch {
      return res.send(this.error.e('auth/invalid-token'));
    }
  }
}
