import { CoreService, ErrorsService } from '@/common';
import { FirebaseModule, Neo4jModule } from '@/config';
import { IdResponse, UserSchema } from '@/types';
import { Injectable } from '@nestjs/common';
import { DocumentReference, Firestore } from 'firebase-admin/firestore';

@Injectable()
export class UserService {
  private error: ErrorsService;
  private coreService: CoreService;
  private neo4j: Neo4jModule;
  private db: Firestore;

  constructor() {
    this.error = new ErrorsService();
    this.coreService = new CoreService();
    this.neo4j = new Neo4jModule();
    this.db = new FirebaseModule().getFirestore();
  }

  public getMeteorCount = (): Promise<number> => {
    return new Promise((resolve) => {
      //TODO  @TheInfernalNick
      return resolve(0);
    });
  };

  public getFriendsCount = (uid: string): Promise<number> => {
    return new Promise(async (resolve) => {
      const query: string = `MATCH (u:User)-[:Friend]-(t:User) where u.name = '${uid}' RETURN t`;
      const resultQueryFriends = await this.neo4j
        .neo()
        .executeWrite((tx) => tx.run(query));
      const friends = resultQueryFriends.records.map((row) => row.get('t'));

      resolve(friends.length);
    });
  };

  public updateUserInfo = (
    uid: string,
    userSchema: UserSchema,
  ): Promise<IdResponse> => {
    return new Promise(async (resolve) => {
      const docRef: DocumentReference = this.db.collection('users').doc(uid);

      await docRef.set({
        ...userSchema,
      });

      const query: string = `MATCH (u:User) where u.name = '${uid}' SET u.interests = '${userSchema.interests}'`; //sets everything that can be changed
      await this.neo4j.neo().executeWrite((tx) => tx.run(query));

      const id: string = docRef.id;
      const idResponse: IdResponse = {
        id,
      };
      return resolve(idResponse);
    });
  };

  public deleteUser = (uid: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        //deletes the user reference and session in firebase and deletes the note in neo4j
        //firebase
        this.coreService.delete(uid, 'users');
        this.coreService.delete(uid, 'sessions');

        //neo4j
        const query: string = `MATCH (u:User) where u.name = '${uid}' DETACH DELETE u`;
        await this.neo4j.neo().executeWrite((tx) => tx.run(query));

        return resolve(uid);
      } catch {
        return reject(this.error.e('server/delete-failed'));
      }
    });
  };
}
