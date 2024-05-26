import { ErrorsService } from '@/common';
import { FirebaseModule } from '@/config';
import { AuthService } from '@/handlers/auth/auth.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
} from 'firebase-admin/firestore';
import { JWTPayload } from 'jose';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private db: Firestore;
  private authService: AuthService;
  private error: ErrorsService;

  constructor() {
    this.db = new FirebaseModule().getFirestore();
    this.authService = new AuthService();
    this.error = new ErrorsService();
  }

  use(req: any, res: any, next: () => void) {
    const authorization: string = req.headers.authorization;
    const token: string = authorization.split('Bearer ')[1];

    this.authService
      .jwtVerification(token)
      .then(async (payload: JWTPayload) => {
        //validate if the token is signed
        const uid: string = payload.uid as string;

        const docRef: DocumentReference = this.db
          .collection('sessions')
          .doc(uid);
        const jwt: string = authorization.split('Bearer ')[1];

        const snapshot: DocumentSnapshot = await docRef.get();
        const data: DocumentData = snapshot.data()!;

        if (jwt === data.jwt) {
          //check if the token is the same saved in firestore
          res.locals.uid = uid; //save the uid of the user to manipulate only his data
          next();
        } else this.error.e('auth/invalid-token');
      });
  }
}
