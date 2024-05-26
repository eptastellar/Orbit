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

  async use(req: any, res: any, next: () => void) {
    console.log('session middleware');

    const authorization: string = req.headers.authorization;

    if (authorization) {
      const token: string = authorization.split('Bearer ')[1];

      const payload: JWTPayload = await this.authService.jwtVerification(token);
      //validate if the token is signed
      const uid: string = payload.uid as string;

      const docRef: DocumentReference = this.db.collection('sessions').doc(uid);
      const jwt: string = authorization.split('Bearer ')[1];

      const snapshot: DocumentSnapshot = await docRef.get();
      const data: DocumentData = snapshot.data()!;

      if (jwt === data.jwt) {
        //check if the token is the same saved in firestore
        req.body.uid = uid; //save the uid of the user to manipulate only his data
        next();
      } else res.send(this.error.e('auth/invalid-token'));
    } else res.send(this.error.e('auth/invalid-token'));
  }
}
