import { ErrorsService } from '@/common';
import { FirebaseModule, Neo4jModule } from '@/config';
import { ContentFetch, IdResponse, PostResponse, UserSchema } from '@/types';
import { Injectable } from '@nestjs/common';
import {
  DocumentData,
  DocumentReference,
  Query,
  QuerySnapshot,
  WriteBatch,
} from 'firebase-admin/firestore';
import { QueryResult } from 'neo4j-driver';

@Injectable()
export class CoreService {
  private db: FirebaseFirestore.Firestore;
  private error: ErrorsService;
  private neo4j: Neo4jModule;
  private bucket: any;

  constructor() {
    this.db = new FirebaseModule().getFirestore();
    this.error = new ErrorsService();
    this.neo4j = new Neo4jModule();
    this.bucket = new FirebaseModule().getBucket();
  }

  public counter = (
    id: string,
    path: string,
    reference: string,
  ): Promise<number> => {
    return new Promise(async (resolve) => {
      const snapshot = await this.db
        .collection(path)
        .where(reference, '==', id)
        .count()
        .get();

      const data = snapshot.data();
      return resolve(data.count);
    });
  };

  public hasPermissionTo = (
    uid: string,
    id: string,
    path: string,
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentReference = this.db.collection(path).doc(id);
        const doc: DocumentData = await docRef.get();
        const data: DocumentData = await doc.data();

        if (data.owner === uid) return resolve();
        else return reject(this.error.e('server/unauthorized'));
      } catch {
        return reject(this.error.e('server/unauthorized'));
      }
    });
  };

  public delete = (reference: string, path: string): Promise<IdResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentReference = this.db
          .collection(path)
          .doc(reference);
        await docRef.delete();

        const id = docRef.id;
        const idResponse: IdResponse = {
          id,
        };
        return resolve(idResponse);
      } catch {
        return reject(this.error.e('server/delete-failed'));
      }
    });
  };

  public getUserDataFromUid = async (uid: string): Promise<UserSchema> => {
    //retrieve user informations based from the uid
    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentReference = this.db.collection('users').doc(uid);
        const doc: DocumentData = await docRef.get();
        const data: DocumentData[string] = await doc.data();

        const username: string = data?.username;
        const name: string = data?.name;
        const pfp: string = data?.pfp;
        const bday: number = data?.bday;

        const query: string = `MATCH (u:User) where u.name = '${uid}' RETURN u.interests`; //retrieves the interests from neo4j for a specific user
        const result: QueryResult = await this.neo4j
          .neo()
          .executeRead((tx) => tx.run(query));
        const results: string[] = result.records.map((row: any) =>
          row.get('u.interests'),
        );
        const interests: string[] = results[0].split(',');

        const userSchema: UserSchema = {
          username,
          name,
          pfp,
          bday,
          interests,
        };
        return resolve(userSchema);
      } catch {
        return reject(this.error.e('server/user-not-found'));
      }
    });
  };

  public getOwner = (id: string, path: string): Promise<string> => {
    return new Promise(async (resolve) => {
      const docRef: DocumentReference = this.db.collection(path).doc(id);
      const doc: DocumentData = await docRef.get();
      const data: DocumentData = await doc.data();

      return resolve(data?.owner);
    });
  };

  public areFriends = (uid: string, friendUid: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (uid !== friendUid) {
        const query: string = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) where u.name = "${uid}" AND t.name = "${friendUid}" RETURN t`;
        const resultMap: QueryResult = await this.neo4j
          .neo()
          .executeRead((tx) => tx.run(query));
        const check = resultMap.records.map((row: any) => row.get('t'));

        if (check[0] !== null) return resolve();
        else return reject(this.error.e('server/not-friends'));
      } else return resolve();
    });
  };

  public getUidFromUserData = async (username: string): Promise<string> => {
    //retrieve uid based from the username
    return new Promise(async (resolve, reject) => {
      try {
        const snapshot: QuerySnapshot = await this.db
          .collection('users')
          .where('username', '==', username)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          //retrieve documents where the username is equal to the username param
          const uid: string[] = await Promise.all(
            snapshot.docs.map(async (doc: DocumentData) => {
              return doc.ref.id;
            }),
          );
          return resolve(uid[0]); //return the uid of the username
        }
      } catch {
        return reject(this.error.e('server/user-not-found'));
      }
    });
  };

  public addNotification = (
    likerUid: string,
    ownerUid: string,
    type: 'like' | 'comment',
  ): Promise<void> => {
    return new Promise(async (resolve) => {
      const docRef: DocumentReference = this.db
        .collection('notifications')
        .doc();

      const { username } = await this.getUserDataFromUid(likerUid);

      await docRef.set({
        notifier: username,
        to_who: ownerUid,
        created_at: Date.now(),
        type: type,
      });

      return resolve();
    });
  };

  public fetchPosts = (
    uids: string[],
    uid: string,
    lastPostId?: string,
  ): Promise<ContentFetch> => {
    const limit: number = 5;

    return new Promise(async (resolve, reject) => {
      let query: Query = this.db
        .collection('posts')
        .where('owner', 'in', uids)
        .orderBy('created_at', 'desc')
        .limit(limit);

      if (lastPostId) {
        const lastDoc: DocumentData = await this.db
          .collection('posts')
          .doc(lastPostId)
          .get();
        query = query.startAfter(lastDoc); // add the start after if is a next page request
      }

      const snapshot: QuerySnapshot = await query.get();

      const content: PostResponse[] = await Promise.all(
        snapshot.docs.map(async (doc: DocumentData) => {
          const id: string = doc.id;
          const data: DocumentData[string] = doc.data();
          const userSchema: UserSchema = await this.getUserDataFromUid(
            data.owner,
          );
          const isLiked: boolean = await this.isLiked(id, uid);
          const likes: number = await this.counter(id, 'likes', 'post_id');
          const comments: number = await this.counter(
            id,
            'comments',
            'post_id',
          );

          return {
            id: id,
            created_at: data.created_at,
            text: data.text,
            type: data.type,
            content: data.content,
            likes: likes,
            comments: comments,
            is_liked: isLiked,
            user_data: { ...userSchema },
          };
        }),
      );

      if (content.length > 0) {
        const last_doc_id: string =
          snapshot.docs[snapshot.docs.length - 1].ref.id;
        const contentFetch: ContentFetch = {
          content,
          last_doc_id,
        };
        return resolve(contentFetch);
      } else return reject(this.error.ne('server/no-content'));
    });
  };

  public getFriendList = (uid: string): Promise<string[]> => {
    return new Promise(async (resolve, reject) => {
      const tempArray: string[] = [];
      const queryFriends: string = `MATCH (n:User)-[:Friend]-(p:User) where n.name = '${uid}' RETURN p`;
      const resultMap: QueryResult = await this.neo4j
        .neo()
        .executeRead((tx) => tx.run(queryFriends));
      const uids = resultMap.records.map((row: any) => row.get('p'));
      uids.forEach((element: any) => {
        tempArray.push(element.properties['name']);
      });

      if (tempArray.length > 0) return resolve(tempArray);
      else return reject(this.error.e('server/no-friends'));
    });
  };

  public removeBatch = (type: string, uid: string): Promise<void> => {
    return new Promise(async (resolve) => {
      const snapshot: QuerySnapshot = await this.db
        .collection(type)
        .where('owner', '==', uid)
        .get();

      const batch: WriteBatch = this.db.batch();
      snapshot.docs.forEach((doc: DocumentData) => {
        batch.delete(doc.ref);
      }); //removes all the posts of the user in one batch to dont overload firebase

      await batch.commit();

      if (snapshot.size === 0) return resolve();

      process.nextTick(() => {
        this.removeBatch(type, uid);
      });
    });
  };

  public isLiked = (postId: string, uid: string): Promise<boolean> => {
    return new Promise(async (resolve) => {
      const snapshot: QuerySnapshot = await this.db
        .collection('likes')
        .where('liker', '==', uid)
        .where('post_id', '==', postId)
        .get();

      return resolve(!snapshot.empty);
    });
  };

  public randomPicture = (prefix: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        this.bucket.getFiles({ prefix: prefix }, (_, files) => {
          // get the files from the bucket with the defined prefix
          const urls: string[] = [];
          if (files) {
            files.splice(0, 1); // remove the first file from the files array

            Promise.all(
              files.map(
                (
                  file, // map over the files array and create a new promise for each file
                ) =>
                  file.getSignedUrl({
                    action: 'read',
                    expires: Date.now() + 30 * 24 * 60 * 60 * 1000 * 12 * 10, // expiration set to 10 years from now
                  }),
              ),
            ).then((results) => {
              results.forEach((result) => {
                // push the result of each promise (the generated URL) into the urls array
                urls.push(result[0]);
              });
              return resolve(urls[Math.floor(Math.random() * urls.length)]); // resolve the promise with a random URL from the urls array
            });
          } else return reject(this.error.ne('server/no-content'));
        });
      } catch {
        return reject(this.error.ne('server/no-content'));
      }
    });
  };
}
