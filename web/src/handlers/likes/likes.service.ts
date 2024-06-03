import { CoreService, ErrorsService } from '@/common';
import { FirebaseModule } from '@/config';
import { IdResponse } from '@/types';
import { Injectable } from '@nestjs/common';
import {
  DocumentReference,
  DocumentSnapshot,
  Firestore,
} from 'firebase-admin/firestore';

@Injectable()
export class LikesService {
  private coreService: CoreService;
  private db: Firestore;
  private error: ErrorsService;

  constructor() {
    this.coreService = new CoreService();
    this.db = new FirebaseModule().getFirestore();
    this.error = new ErrorsService();
  }

  public updateLike = (postId: string, uid: string): Promise<IdResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentReference = this.db
          .collection('likes')
          .doc(uid + postId);
        const snapshot: DocumentSnapshot = await docRef.get();

        if (!snapshot.exists) {
          this.newLike(postId, uid).then((id: string) => {
            const idResponse: IdResponse = {
              id,
            };

            resolve(idResponse);
          });
        } else return resolve(this.coreService.delete(uid + postId, 'likes')); //remove the like
      } catch {
        return reject(this.error.e('server/update-failed'));
      }
    });
  };

  private newLike = (postId: string, uid: string): Promise<string> => {
    return new Promise(async (resolve) => {
      const docRef: DocumentReference = this.db
        .collection('likes')
        .doc(uid + postId);

      await docRef.set({
        owner: uid,
        post_id: postId,
      });
      return resolve(docRef.id);
    });
  };
}
