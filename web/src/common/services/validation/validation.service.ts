import { interests } from '@/assets';
import { ErrorsService } from '@/common';
import { FirebaseModule, Neo4jModule } from '@/config';
import { Injectable } from '@nestjs/common';
import {
  DocumentData,
  Firestore,
  QuerySnapshot,
} from 'firebase-admin/firestore';
import { QueryResult } from 'neo4j-driver';

@Injectable()
export class ValidationService {
  private firebase: FirebaseModule;
  private neo4j: Neo4jModule;
  private db: Firestore;
  private error: ErrorsService;
  private bucket: any;

  constructor() {
    this.firebase = new FirebaseModule();
    this.db = this.firebase.getFirestore();
    this.neo4j = new Neo4jModule();
    this.error = new ErrorsService();
    this.bucket = this.firebase.getBucket();
  }

  public birthdateValidation = async (bday: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (!bday || bday > Date.now() / 1000 || bday < -2208988800)
          return reject(this.error.e('validation/invalid-birthdate'));

        if (Date.now() / 1000 - 441806400 - bday <= 0)
          return reject(this.error.e('validation/too-young'));

        return resolve();
      } catch {
        return reject(this.error.e('validation/malformed-input'));
      }
    });
  };

  public usernameValidation = async (username: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const regex: RegExp = /[^a-zA-Z0-9\_\-\.]/;

        if (
          !username ||
          !username.startsWith('@') ||
          username.substring(1).match(regex)
        )
          return reject(this.error.e('validation/invalid-username')); //check if the username i approved by the regex

        if (username.length > 24 + 1)
          return reject(this.error.e('validation/username-too-long'));

        if (username.length < 6 + 1)
          return reject(this.error.e('validation/username-too-short'));

        const snapshot: QuerySnapshot = await this.db
          .collection('users') //search where the username is equal to the input username
          .where('username', '==', username)
          .get();

        if (snapshot.empty)
          return resolve(); //check if username is already used
        else return reject(this.error.e('validation/username-already-in-use'));
      } catch {
        return reject(this.error.e('validation/malformed-input'));
      }
    });
  };

  public interestsValidation = async (
    interestsList: string[],
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (interestsList.length > 5 || interestsList.length < 1)
          return reject(this.error.e('validation/invalid-number-of-interests'));

        interestsList.forEach((element) => {
          if (!interests.includes(element))
            return reject(this.error.e('validation/invalid-interests'));
        });
        return resolve();
      } catch {
        return reject(this.error.e('validation/malformed-input'));
      }
    });
  };

  public documentIdValidation = (id: string, path: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentData = await this.db
          .collection(path)
          .doc(id)
          .get();

        if (docRef.exists) return resolve();
        else return reject(this.error.e('validation/invalid-document-id'));
      } catch {
        return reject(this.error.e('validation/invalid-document-id'));
      }
    });
  };

  public commentRootIdValidation = async (
    rootId: string,
    postId: string,
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentData = await this.db
          .collection('comments')
          .doc(rootId)
          .get(); //retrieve the root comment

        if (docRef.exists) {
          const data: DocumentData = await docRef.data();
          if (data.post_id === postId) return resolve();
          else return reject(this.error.e('validation/invalid-document-id'));
        } else return reject(this.error.e('validation/invalid-document-id'));
      } catch {
        return reject(this.error.e('validation/invalid-document-id'));
      }
    });
  };

  public commentLeafIdValidation = async (
    leafId: string,
    rootId: string,
    postId: string,
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const leafRef: DocumentData = await this.db
          .collection('comments')
          .doc(leafId)
          .get(); //retrieve the leaf comment
        const rootRef: DocumentData = await this.db
          .collection('comments')
          .doc(rootId)
          .get(); //retrieve the root comment
        const leafData: DocumentData[string] = leafRef.data();
        const rootData: DocumentData[string] = rootRef.data();

        if (rootRef.exists) {
          if (rootData.post_id === postId) {
            if (leafData.post_id === postId) {
              if (leafData.root_id === rootId) return resolve();
              else
                return reject(this.error.e('validation/invalid-document-id'));
            } else
              return reject(this.error.e('validation/invalid-document-id'));
          } else return reject(this.error.e('validation/invalid-document-id'));
        } else return reject(this.error.e('validation/invalid-document-id'));
      } catch {
        return reject(this.error.e('validation/invalid-document-id'));
      }
    });
  };

  public contentValidation = async (
    text?: string,
    content?: string,
    type?: string,
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (content) {
          if (text) await this.harmfulContentValidation(text);

          if (type === 'image' || type === 'audio')
            await this.mediaValidation(content);
          else return reject(this.error.e('validation/malformed-input'));
        } else {
          if (text) await this.harmfulContentValidation(text);
          else return reject(this.error.e('validation/malformed-input'));
        }
        return resolve();
      } catch (error) {
        return reject(error);
      }
    });
  };

  public mediaValidation = (media: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const cleanURL: string = media.split('appspot.com/o/')[1];
        const removeToken: string = cleanURL.split('?')[0];

        const formattedPath: string = removeToken.replace(/%2F/g, '/');
        const fileRef = this.bucket.file(decodeURIComponent(formattedPath));

        fileRef.exists().then((exists) => {
          if (exists[0]) return resolve();
          else return reject(this.error.e('validation/invalid-image-path'));
        });
      } catch {
        return reject(this.error.e('validation/malformed-url'));
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private harmfulContentValidation = (text: string): Promise<void> => {
    //TODO
    return new Promise((resolve) => {
      return resolve();
    });
  };

  private userFriends = (uid: string): Promise<string[]> => {
    return new Promise(async (resolve) => {
      const friendsQuery: string = `MATCH (u:User {name: ${uid}})-[:Friend]->(f:User) RETURN f.name AS names`;
      const friendsResult: QueryResult = await this.neo4j
        .neo()
        .executeRead((tx) => tx.run(friendsQuery));
      return resolve(
        friendsResult.records.map((record) => record.get('names')),
      );
    });
  };

  public membersValidation = (
    uid: string,
    members: string[],
  ): Promise<string[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (members.length < 2)
          return reject(this.error.e('validation/invalid-number-of-members'));

        const friends: string[] = await this.userFriends(uid);
        friends.forEach(async (friend) => {
          const friendsOfFriends: string[] = await this.userFriends(friend);
          members = members.filter((member) =>
            friendsOfFriends.includes(member),
          );
        });
        return resolve(members);
      } catch (error) {
        return reject(error);
      }
    });
  };
}
