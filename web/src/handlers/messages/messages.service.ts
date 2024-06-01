import { ErrorsService } from '@/common';
import { FirebaseModule } from '@/config';
import { IdResponse } from '@/types';
import { Injectable } from '@nestjs/common';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  QuerySnapshot,
} from 'firebase-admin/firestore';

@Injectable()
export class MessagesService {
  private error: ErrorsService;
  private db: Firestore;

  constructor() {
    this.error = new ErrorsService();
    this.db = new FirebaseModule().getFirestore();
  }

  public getMembersFromChatId = (
    uid: string,
    chatId: string,
  ): Promise<string[]> => {
    return new Promise(async (resolve) => {
      const snapshot: QuerySnapshot = await this.db
        .collection('users-chats')
        .where('chat_id', '==', chatId)
        .where('user_id', '!=', uid)
        .get();

      const members: string[] = await Promise.all(
        snapshot.docs.map(async (doc: DocumentData) => {
          const data: DocumentData[string] = await doc.data();
          return data.user_id;
        }),
      );

      return resolve(members);
    });
  };

  public newChatMessage = (
    uid: string,
    chatId: string,
    members: string[],
    isGroup: boolean,
    text?: string,
    type?: string,
    content?: string,
  ): Promise<IdResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        let docRef: DocumentReference = this.db.collection('messages').doc(); //set the docRef to messages
        const id: string = docRef.id;

        await docRef.set({
          //set the message information in firestore
          owner: uid,
          created_at: Date.now(), //unix format
          chat_id: chatId,
        });

        if (text) await docRef.update({ text: text });
        if (content) await docRef.update({ content: content, type: type });

        if (!isGroup) {
          members.forEach(async (memberId: string) => {
            //set if the message is opened
            docRef = this.db.collection('opened-messages').doc();

            await docRef.set({
              user_id: memberId,
              chat_id: chatId,
              message_id: id,
              opened: false,
            });
          });
        }

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
