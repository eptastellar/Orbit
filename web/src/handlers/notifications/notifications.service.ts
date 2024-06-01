import { FirebaseModule } from '@/config';
import { NotificationResponse } from '@/types';
import { Injectable } from '@nestjs/common';
import { DocumentData, Firestore, Query } from 'firebase-admin/firestore';

@Injectable()
export class NotificationsService {
  private db: Firestore;

  constructor() {
    this.db = new FirebaseModule().getFirestore();
  }

  public getNotifications = (
    uid: string,
    filter: 'none' | 'comment' | 'like',
  ): Promise<NotificationResponse[]> => {
    const limit = 10;

    return new Promise(async (resolve) => {
      let query: Query = this.db
        .collection('notifications')
        .where('to_who', '==', uid)
        .orderBy('created_at', 'desc')
        .limit(limit);

      if (filter !== 'none') query = query.where('type', '==', filter);

      const snapshot = await query.get();

      const notifications: NotificationResponse[] = await Promise.all(
        snapshot.docs.map(async (doc: DocumentData) => {
          const data: DocumentData[string] = await doc.data();
          const notifier: string = data.notifier;
          const type: string = data.type;

          return { notifier, type };
        }),
      );

      return resolve(notifications);
    });
  };
}
