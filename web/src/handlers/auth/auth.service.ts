import { CoreService, ErrorsService, ValidationService } from '@/common';
import { FirebaseModule, Neo4jModule } from '@/config';
import { SuccessResponse, UserSchema } from '@/types';
import { Injectable } from '@nestjs/common';
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
} from 'firebase-admin/firestore';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { Session } from 'neo4j-driver';

@Injectable()
export class AuthService {
  private neo4j: Neo4jModule;
  private db: Firestore;
  private error: ErrorsService;
  private validationService: ValidationService;
  private coreService: CoreService;

  constructor() {
    this.neo4j = new Neo4jModule();
    this.db = new FirebaseModule().getFirestore();
    this.error = new ErrorsService();
    this.coreService = new CoreService();
    this.validationService = new ValidationService();
  }

  private newSessionJWT = async (uid: string) => {
    const payload = { uid: uid };
    const secret: Uint8Array = new TextEncoder().encode(
      process.env.JWT_SECRET_KEY,
    );

    const jwt: string = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('4w') //create a jwt and set the expire time to 4 weeks
      .sign(secret);

    return jwt;
  };

  public logOut = (uid: string): Promise<SuccessResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentReference = this.db
          .collection('sessions')
          .doc(uid);
        await docRef.set({ jwt: '' });

        const successResponse: SuccessResponse = {
          success: true,
        };
        return resolve(successResponse);
      } catch {
        return reject(this.error.e('auth/log-out-failed'));
      }
    });
  };

  public jwtVerification = (token: string): Promise<JWTPayload> => {
    return new Promise(async (resolve, reject) => {
      try {
        const secret: Uint8Array = new TextEncoder().encode(
          process.env.JWT_SECRET_KEY,
        );

        const { payload } = await jwtVerify(token, secret); //validate the user token and return the user payload

        return resolve(payload); //return the token payload
      } catch {
        return reject(this.error.e('auth/expired-token'));
      }
    });
  };

  public newSession = async (uid: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      const docRef: DocumentReference = this.db.collection('sessions').doc(uid); //create a new doc in the collection /sessions
      const doc: DocumentData = await docRef.get();
      const data: DocumentData = await doc.data();
      const token: string = data?.jwt;

      if (token) {
        this.jwtVerification(token)
          .then(() => {
            return resolve(token); //if the token is still valid return it
          })
          .catch(async (error) => {
            await docRef.set({ jwt: '' }); //clear the firestore jwt and make the user sign in again
            return reject(error);
          });
      } else return resolve(await this.refreshSession(docRef, uid)); //if the document is empty refresh the session
    });
  };

  private refreshSession = async (
    docRef: DocumentReference,
    uid: string,
  ): Promise<string> => {
    return new Promise(async (resolve) => {
      const jwt: string = await this.newSessionJWT(uid); //generate a new session token

      await docRef.set({ jwt }); //refresh the token in the session token:
      return resolve(jwt);
    });
  };

  public newUserDocument = (
    uid: string,
    username: string,
    bday: number,
    pfp?: string,
  ): Promise<UserSchema> => {
    return new Promise(async (resolve, reject) => {
      const docRef: DocumentReference = this.db.collection('users').doc(uid);
      const name: string = username.substring(1); //remove the "@" from the username
      const snapshot: DocumentSnapshot = await docRef.get();

      if (!snapshot.exists) {
        //check if the user is already registered to prevent rewrites
        try {
          if (pfp) await this.validationService.mediaValidation(pfp);
          pfp = pfp
            ? pfp
            : await this.coreService.randomPicture('default/personal'); //set the pfp url to the one sent from the client, or if is null, select a random one

          await docRef.set({
            //set the user data into the doc
            username: username,
            name: name,
            pfp: pfp,
            bday: bday,
          });

          const userSchema: UserSchema = {
            username: username,
            name: name,
            pfp: pfp,
            bday: bday,
          };
          return resolve(userSchema);
        } catch (error) {
          return reject(error);
        }
      } else return reject(this.error.e('server/user-already-exists'));
    });
  };

  public newUserNode = (uid: string, interests: string[]): Promise<void> => {
    return new Promise(async (resolve) => {
      const neo4j: Session = this.neo4j.neo();
      const query = `MERGE (:User {name:'${uid}', interests:'${interests}'})`; //create a new node in neo4j
      await neo4j.executeWrite((tx) => tx.run(query));
      return resolve();
    });
  };
}
