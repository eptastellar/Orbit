import { CoreService, ErrorsService } from '@/common';
import { FirebaseModule } from '@/config';
import {
  CommentSchema,
  ContentFetch,
  IdResponse,
  RootCommentSchema,
  SuccessResponse,
  UserSchema,
} from '@/types';
import { Injectable } from '@nestjs/common';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  Query,
  QuerySnapshot,
  WriteBatch,
} from 'firebase-admin/firestore';

@Injectable()
export class CommentsService {
  private coreService: CoreService;
  private error: ErrorsService;
  private db: Firestore;

  constructor() {
    this.error = new ErrorsService();
    this.coreService = new CoreService();
    this.db = new FirebaseModule().getFirestore();
  }

  public fetchRootComments = (
    postId: string,
    lastRootCommentId: string,
  ): Promise<ContentFetch> => {
    const limit: number = 5;

    return new Promise(async (resolve, reject) => {
      let query: Query = this.db
        .collection('comments')
        .where('post_id', '==', postId)
        .where('root_id', '==', true)
        .orderBy('created_at', 'desc')
        .limit(limit);

      if (lastRootCommentId) {
        const lastDoc: DocumentData = await this.db
          .collection('comments')
          .doc(lastRootCommentId)
          .get();
        query = query.startAfter(lastDoc); // add the start after if is a next page request
      }

      const snapshot: QuerySnapshot = await query.get();

      const content: RootCommentSchema[] = await Promise.all(
        snapshot.docs.map(async (doc: DocumentData) => {
          const data: DocumentData[string] = doc.data();
          const userSchema: UserSchema =
            await this.coreService.getUserDataFromUid(data.owner);
          const leafs: number = await this.coreService.counter(
            doc.id,
            'comments',
            'root_id',
          );

          const comment: CommentSchema = {
            id: doc.id,
            created_at: data.created_at,
            content: data.content,
            user_data: { ...userSchema },
          };

          return {
            comment: { ...comment },
            leafs: leafs,
          };
        }),
      );

      if (content.length > 0) {
        const last_doc_id: string =
          snapshot.docs[snapshot.docs.length - 1].ref.id;
        const contentFetch: ContentFetch = { content, last_doc_id };
        return resolve(contentFetch);
      } else return reject(this.error.ne('server/no-content'));
    });
  };

  public fetchLeafsComments = (
    rootId: string,
    lastLeafCommentId: string,
  ): Promise<ContentFetch> => {
    const limit: number = 5;

    return new Promise(async (resolve, reject) => {
      let query: Query = this.db
        .collection('comments')
        .where('root_id', '==', rootId)
        .orderBy('created_at', 'desc')
        .limit(limit);

      if (lastLeafCommentId) {
        const lastDoc: DocumentData = await this.db
          .collection('comments')
          .doc(lastLeafCommentId)
          .get();
        query = query.startAfter(lastDoc); // add the start after if is a next page request
      }

      const snapshot: QuerySnapshot = await query.get();

      const content: CommentSchema[] = await Promise.all(
        snapshot.docs.map(async (doc: DocumentData) => {
          const data: DocumentData[string] = doc.data();
          const userSchema: UserSchema =
            await this.coreService.getUserDataFromUid(data.owner);

          return {
            id: doc.id,
            created_at: data.created_at,
            content: data.content,
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

  public deleteComment = (commentId: string): Promise<SuccessResponse> => {
    return new Promise(async (resolve) => {
      try {
        const docRef: DocumentReference = this.db
          .collection('comments')
          .doc(commentId);
        const snapshot: QuerySnapshot = await this.db
          .collection('comments')
          .where('root_id', '==', commentId)
          .get();

        const batch: WriteBatch = this.db.batch();
        snapshot.docs.forEach((doc: DocumentData) => {
          batch.delete(doc.ref);
        });

        batch.delete(docRef);
        await batch.commit();

        const successResponse: SuccessResponse = {
          success: true,
        };
        return resolve(successResponse);
      } catch {
        return this.error.e('server/delete-failed');
      }
    });
  };

  public newComment = (
    uid: string,
    rootId: string,
    postId: string,
    content: string,
  ): Promise<IdResponse> => {
    return new Promise(async (resolve) => {
      try {
        const docRef: DocumentReference = this.db.collection('comments').doc(); //set the docRef to comments
        const root: string | boolean = rootId ? rootId : true; //if the post has no root, set the root to true, so the comment is not a response comment

        await docRef.set({
          //set the comment information in firestore
          owner: uid,
          root_id: root,
          content: content,
          post_id: postId,
          created_at: Date.now(), //unix format
        });

        const id: string = docRef.id;
        const idResponse: IdResponse = {
          id,
        };
        return resolve(idResponse);
      } catch {
        return this.error.e('server/upload-failed');
      }
    });
  };
}
