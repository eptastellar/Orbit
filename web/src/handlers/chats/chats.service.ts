import { CoreService, ErrorsService } from '@/common';
import { FirebaseModule } from '@/config';
import {
  ChatSchema,
  ChatsResponse,
  ContentFetch,
  IdResponse,
  LatestMessageSchema,
  MessageSchema,
  PersonalChatInfoResponse,
  UserSchema,
} from '@/types';
import { Injectable } from '@nestjs/common';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  Query,
  QuerySnapshot,
} from 'firebase-admin/firestore';

@Injectable()
export class ChatsService {
  private db: Firestore;
  private error: ErrorsService;
  private coreService: CoreService;

  constructor() {
    this.db = new FirebaseModule().getFirestore();
    this.error = new ErrorsService();
    this.coreService = new CoreService();
  }

  public getPersonalChatInfo = (
    uid: string,
    chatId: string,
  ): Promise<PersonalChatInfoResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const snapshot: DocumentData = await this.db
          .collection('users-chats')
          .where('chat_id', '==', chatId)
          .where('user_id', '!=', uid)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const userSchema: UserSchema[] = await Promise.all(
            snapshot.docs.map(async (doc: DocumentData) => {
              const data: DocumentData[string] = doc.data();
              const userSchema: UserSchema =
                await this.coreService.getUserDataFromUid(data.user_id);

              return userSchema;
            }),
          );

          await this.setChatVisualizationOfMessages(uid, chatId);

          const personalChatInfoResponse: PersonalChatInfoResponse = {
            user_data: { ...userSchema[0] },
          };
          return resolve(personalChatInfoResponse);
        } else return reject(this.error.e('server/failed-fetch'));
      } catch (error) {
        return reject(error);
      }
    });
  };

  public fetchChatMessages = (
    uid: string,
    chatId: string,
    isGroup: boolean,
    lastMessageId?: string,
  ): Promise<ContentFetch> => {
    const limit: number = 7;

    return new Promise(async (resolve, reject) => {
      let query: Query = this.db
        .collection('messages')
        .where('chat_id', '==', chatId)
        .where('created_at', '>=', Date.now() - 24 * 60 * 60 * 1000) // 24h before
        .orderBy('created_at', 'desc')
        .limit(limit);

      if (lastMessageId) {
        const lastDoc: DocumentData = await this.db
          .collection('messages')
          .doc(lastMessageId)
          .get();
        query = query.startAfter(lastDoc); // add the start after if is a next page request
      }

      const snapshot: QuerySnapshot = await query.get();

      const content: MessageSchema[] = await Promise.all(
        snapshot.docs.map(async (doc: DocumentData) => {
          const id: string = doc.id;
          const data: DocumentData[string] = doc.data();
          const owner: string = data.owner;
          const userSchema: UserSchema =
            await this.coreService.getUserDataFromUid(owner);
          const isOpened: boolean = isGroup
            ? false
            : await this.getIfMessageIsSeen(id, chatId, uid);

          return {
            id: id,
            personal: uid === owner,
            created_at: data.created_at,
            text: data.text,
            type: data.type,
            content: data.content,
            pfp: userSchema.pfp,
            username: userSchema.username,
            opened: isOpened,
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

  public newPersonalChat = (
    uid: string,
    receiverUid: string,
  ): Promise<IdResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentReference = this.db
          .collection('personal-chats')
          .doc(); //set the docRef to chats

        await docRef.set({
          //set the chat information in firestore
          created_at: Date.now(), //unix format
        });

        const id: string = docRef.id;
        let memberRef: DocumentReference = this.db
          .collection('users-chats')
          .doc();
        await memberRef.set({
          user_id: uid,
          chat_id: id,
        });

        memberRef = this.db.collection('users-chats').doc();
        await memberRef.set({
          user_id: receiverUid,
          chat_id: id,
        });

        const idResponse: IdResponse = {
          id,
        };
        return resolve(idResponse);
      } catch {
        return reject(this.error.e('server/upload-failed'));
      }
    });
  };

  public getPersonalChats = (uid: string): Promise<ChatsResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const snapshot: QuerySnapshot = await this.db
          .collection('users-chats')
          .where('user_id', '==', uid)
          .get();

        const chats: ChatSchema[] = await Promise.all(
          snapshot.docs.map(async (doc: DocumentData) => {
            const data: DocumentData[string] = doc.data();
            const chat_id: string = data.chat_id;
            const docRef: DocumentData = this.db
              .collection('users-chats')
              .where('chat_id', '==', data.chat_id)
              .where('user_id', '!=', uid)
              .limit(1);

            const snapshot: QuerySnapshot = await docRef.get(); //get the uid of receiver

            const receiverUid: string[] = await Promise.all(
              snapshot.docs.map(async (doc: DocumentData) => {
                const data: DocumentData[string] = doc.data();
                const uid: string = data.user_id;
                return uid;
              }),
            );

            const userSchema: UserSchema =
              await this.coreService.getUserDataFromUid(receiverUid[0]);

            const bdayTime: number = userSchema.bday!;
            const date: Date = new Date(bdayTime * 1000);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const bday: boolean =
              day === new Date().getDate() && month === new Date().getMonth();

            const name: string = userSchema.name;
            const pfp: string = userSchema.pfp;
            const unreaded_messages: number =
              await this.getChatUnreadedMessages(uid, data.chat_id);

            if (unreaded_messages > 0) {
              return {
                chat_id,
                name,
                pfp,
                bday,
                unreaded_messages,
              };
            } else {
              const latest_message: LatestMessageSchema =
                await this.getLatestMessage(data.chat_id);
              return {
                chat_id,
                name,
                pfp,
                bday,
                latest_message,
              };
            }
          }),
        );

        if (chats.length > 0) {
          const chatsResponse: ChatsResponse = {
            chats: { ...chats },
          };
          return resolve(chatsResponse);
        } else return reject(this.error.ne('server/no-content'));
      } catch (error) {
        return reject(error);
      }
    });
  };

  private getChatUnreadedMessages = (
    uid: string,
    chatId: string,
  ): Promise<number> => {
    return new Promise(async (resolve) => {
      const snapshot = await this.db
        .collection('opened-messages')
        .where('user_id', '==', uid)
        .where('chat_id', '==', chatId)
        .where('opened', '==', false)
        .count()
        .get();

      const data = snapshot.data();

      return resolve(data.count);
    });
  };

  private getLatestMessage = (chatId: string): Promise<LatestMessageSchema> => {
    return new Promise(async (resolve) => {
      const snapshot = await this.db
        .collection('messages')
        .where('chat_id', '==', chatId)
        .orderBy('created_at', 'desc')
        .limit(1)
        .get();

      const latest_message: LatestMessageSchema[] = await Promise.all(
        snapshot.docs.map(async (doc: DocumentData) => {
          const data: DocumentData[string] = await doc.data();
          const text: string = data.text;
          const content: string = data.content;
          const type: string = data.type;

          if (text) {
            const content: string = text;
            const type: string = 'text';
            return {
              content,
              type,
            };
          }

          return {
            content,
            type,
          };
        }),
      );

      return resolve(latest_message[0]);
    });
  };

  private setChatVisualizationOfMessages = (
    uid: string,
    chatId: string,
  ): Promise<void> => {
    return new Promise(async (resolve) => {
      const snapshot: DocumentData = await this.db
        .collection('opened-messages')
        .where('chat_id', '==', chatId)
        .where('user_id', '!=', uid)
        .where('opened', '==', false)
        .get();

      await Promise.all(
        snapshot.docs.map(async (doc: DocumentData) => {
          const docRef: DocumentReference = doc.ref;

          await docRef.update({
            opened: true,
          });
        }),
      );
      resolve();
    });
  };

  private getIfMessageIsSeen = (
    messageId: string,
    chatId: string,
    uid: string,
  ): Promise<boolean> => {
    return new Promise(async (resolve) => {
      const snapshot = await this.db
        .collection('opened-messages')
        .where('user_id', '==', uid)
        .where('chat_id', '==', chatId)
        .where('message_id', '==', messageId)
        .limit(1)
        .get();

      await Promise.all(
        snapshot.docs.map(async (doc: DocumentData) => {
          const data: DocumentData[string] = await doc.data();

          return resolve(data.opened);
        }),
      );
    });
  };
}
