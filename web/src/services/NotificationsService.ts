import { err, firebase, firestore } from "config"
import { DocumentData, DocumentReference, Firestore } from "firebase-admin/firestore"
import { ContentService, UserService, ValidationService } from "services"
import { ChatSchema, ChatsResponse, IdResponse } from "types"

export default class ChatsService {
   private db: Firestore
   private user: UserService
   private valid: ValidationService
   private cont: ContentService

   constructor() {
      firebase()
      this.db = firestore()
      this.user = new UserService()
      this.cont = new ContentService()
      this.valid = new ValidationService()
   }

   public getChats = (uid: string): Promise<ChatsResponse> => {
      return new Promise((resolve, reject) => {
         const docRef: DocumentData = this.db.collection("users-chats").where("user", "==", uid)

         docRef.get().then((data: DocumentData) => {
            console.log(data)
         })
      })
   }

   public getChat = (uid: string, chatId: string): Promise<ChatSchema> => {
      return new Promise((resolve, reject) => {
         try {
            const docRef: DocumentData = this.db.collection("chats").doc(chatId)

            docRef.get().then((data: DocumentData) => {
               // const chatSchema: ChatSchema = {
               //    name: data.name,
               //    latest_message: "", //TODO
               //    unreaded_messages: 1
               // }
            })
         } catch { reject(err("no buono")) }
      })
   }

   public newChat = (uid: string, members: string[], name?: string, pfp?: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("chats").doc() //set the docRef to chats
            const uids: string[] = []

            await Promise.all(members.map(async (member: string) => {
               const uid: string = await this.user.getUIDfromUserData(member)
               uids.push(uid)
            }))

            await docRef.set({ //set the chat information in firestore
               created_at: Date.now(), //unix format
            })

            if (members.length > 2) {
               if (!name)
                  reject(err("no name"))

               if (pfp) await this.valid.mediaValidation(pfp)
               pfp = pfp ? pfp : await this.cont.randomPicture("default/groups") //set the pfp url to the one sent from the client, or if is null, select a random one

               await docRef.update({
                  admin: uid,
                  name: name,
                  pfp: pfp
               })
            }

            const membersRef: DocumentReference = this.db.collection("users-chats").doc()
            const id: string = docRef.id

            await Promise.all(uids.map(async (uid: string) => {
               await membersRef.set({
                  user: uid,
                  chat: id
               })
            }))

            const idResponse: IdResponse = {
               id
            }
            resolve(idResponse)
         } catch { reject(err("server/upload-failed")) }
      })
   }

   public uploadMessage = (uid: string, chat_id: string, text?: string, type?: string, content?: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("messages").doc() //set the docRef to messages

            await docRef.set({ //set the message information in firestore
               owner: uid,
               created_at: Date.now(), //unix format
               chat_id: chat_id,
            })

            if (text) await docRef.update({ text: text })
            if (content) await docRef.update({ content: content, type: type })

            const id: string = docRef.id
            const idResponse: IdResponse = {
               id
            }
            resolve(idResponse)
         } catch { reject(err("server/upload-failed")) }
      })
   }

   public sendNotification = (receivers: string[]): Promise<null> => {
      return new Promise((resolve, reject) => { //TODO
         resolve(null)
      })
   }
}
