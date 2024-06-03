import { CoreService, ErrorsService } from '@/common';
import { FirebaseModule } from '@/config';
import { IdResponse, PostResponse, UserSchema } from '@/types';
import { Injectable } from '@nestjs/common';
import {
  DocumentData,
  DocumentReference,
  Firestore,
} from 'firebase-admin/firestore';

@Injectable()
export class PostsService {
  private db: Firestore;
  private error: ErrorsService;
  private coreService: CoreService;

  constructor() {
    this.db = new FirebaseModule().getFirestore();
    this.error = new ErrorsService();
    this.coreService = new CoreService();
  }

  public getPost = (uid: string, postId: string): Promise<PostResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentReference = this.db
          .collection('posts')
          .doc(postId);
        const doc: DocumentData = await docRef.get();
        const data: DocumentData = await doc.data();
        const id: string = docRef.id;

        const userSchema: UserSchema =
          await this.coreService.getUserDataFromUid(data.owner);
        const isLiked: boolean = await this.coreService.isLiked(id, uid);
        const likes: number = await this.coreService.counter(
          id,
          'likes',
          'post_id',
        );
        const comments: number = await this.coreService.counter(
          id,
          'comments',
          'post_id',
        );

        const post: PostResponse = {
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

        return resolve(post);
      } catch {
        reject(this.error.e('server/post-not-found'));
      }
    });
  };

  public updatePost = (
    postId: string,
    text?: string,
    content?: string,
    type?: string,
  ): Promise<IdResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentReference = this.db
          .collection('posts')
          .doc(postId);

        if (text) await docRef.update({ text: text });
        if (content) await docRef.update({ content: content, type: type });

        const id: string = docRef.id;
        const idResponse: IdResponse = {
          id,
        };
        return resolve(idResponse);
      } catch {
        return reject(this.error.e('server/update-failed'));
      }
    });
  };

  public newPost = (
    uid: string,
    text?: string,
    type?: string,
    content?: string,
  ): Promise<IdResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentReference = this.db.collection('posts').doc(); //set the docRef to posts

        await docRef.set({
          //set the post information in firestore
          owner: uid,
          created_at: Date.now(), //unix format
        });

        if (text) await docRef.update({ text: text });
        if (content) await docRef.update({ content: content, type: type });

        const id: string = docRef.id;
        const idResponse: IdResponse = {
          id,
        };
        return resolve(idResponse);
      } catch {
        return reject(this.error.e('server/upload-failed'));
      }
    });
  };
}
