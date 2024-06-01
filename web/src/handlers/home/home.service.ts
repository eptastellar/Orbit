import { FirebaseModule } from '@/config';
import { NumberResponse } from '@/types';
import { Injectable } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';

@Injectable()
export class HomeService {
  private db: Firestore;

  constructor() {
    this.db = new FirebaseModule().getFirestore();
  }

  public getUnreadedMessagesCount = (uid: string): Promise<NumberResponse> => {
    return new Promise(async (resolve) => {
      const snapshot = await this.db
        .collection('opened-messages')
        .where('opened', '==', false)
        .where('user_id', '==', uid)
        .count()
        .get();

      const data = snapshot.data();
      const number: number = data.count;
      const numberResponse: NumberResponse = {
        number,
      };
      return resolve(numberResponse);
    });
  };
}
