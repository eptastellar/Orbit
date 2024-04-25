import { err, firebase, firestore } from "config"
import { DocumentData, DocumentReference, Firestore, Query, QuerySnapshot } from "firebase-admin/firestore"
import { ContentService, UserService, ValidationService } from "services"
import { ChatSchema, ChatsResponse, GroupChatInfoResponse, IdResponse, PersonalChatInfoResponse, UserSchema } from "types"

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

   public newPersonalChat = (uid: string, receiverUsername: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const receiverUID: string = await this.user.getUIDfromUserData(receiverUsername)
            const docRef: DocumentReference = this.db.collection("personal-chats").doc() //set the docRef to chats

            await docRef.set({ //set the chat information in firestore
               created_at: Date.now(), //unix format
            })
            const id: string = docRef.id

            let membersRef: DocumentReference = this.db.collection("users-chats").doc()
            await membersRef.set({
               user_id: uid,
               chat_id: id
            })

            membersRef = this.db.collection("users-chats").doc()
            await membersRef.set({
               user_id: receiverUID,
               chat_id: id
            })

            const idResponse: IdResponse = {
               id
            }
            resolve(idResponse)
         } catch { reject(err("server/upload-failed")) }
      })
   }

   public newGroupChat = async (uid: string, members: string[], name: string, pfp?: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            if (pfp) await this.valid.mediaValidation(pfp)
            pfp = pfp ? pfp : await this.cont.randomPicture("default/groups")

            if (!name) return reject(err("no name"))

            this.valid.membersValidation(uid, members).then(async () => {
               const docRef: DocumentReference = this.db.collection("groups").doc() //set the docRef to groups

               await docRef.set({ //set the chat information in firestore
                  created_at: Date.now(), //unix format
                  name: name,
                  pfp: pfp
               })

               const id: string = docRef.id

               const memberRef: DocumentReference = this.db.collection("group-member").doc()
               await memberRef.set({ //set the requester as admin
                  user_id: uid,
                  group_id: id,
                  admin: true
               })

               members.forEach(async (member: string) => {
                  const memberRef: DocumentReference = this.db.collection("group-member").doc()
                  const userId: string = await this.user.getUIDfromUserData(member)

                  await memberRef.set({ //set the group information in firestore
                     user_id: userId,
                     group_id: id,
                     admin: false
                  })
               })

               const idResponse: IdResponse = {
                  id
               }
               resolve(idResponse)
            })
         } catch { reject(err(" failed")) }
      })
   }

   public getPersonalChats = (uid: string): Promise<ChatsResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentData = this.db.collection("users-chats")
               .where("user_id", "==", uid)

            const snapshot: QuerySnapshot = await docRef.get()

            const chats: ChatSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
               const data: DocumentData[string] = doc.data()
               const docRef: DocumentData = this.db.collection("users-chats")
                  .where("chat_id", "==", data.chat_id)
                  .where("user_id", "!=", uid)
                  .limit(1)

               const snapshot: QuerySnapshot = await docRef.get() //get the uid of receiver

               const receiverUID: string[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
                  const data: DocumentData[string] = doc.data()
                  const uid: string = data.user_id
                  return uid
               }))

               const userSchema: UserSchema = await this.user.getUserDatafromUID(receiverUID[0])

               const bdayTime: number = userSchema.bday!
               const date: Date = new Date(bdayTime * 1000)
               const day = date.getDate()
               const month = date.getMonth() + 1
               const bday: boolean = day === new Date().getDate() && month === new Date().getMonth()

               const name: string = userSchema.name
               const pfp: string = userSchema.pfp
               const latest_message: string = await this.getLatestMessage()
               const unreaded_messages: number = 0 //TODO

               return {
                  name,
                  pfp,
                  bday,
                  latest_message,
                  unreaded_messages
               }
            }))

            if (chats.length > 0) {
               const chatsResponse: ChatsResponse = {
                  chats: { ...chats }
               }
               resolve(chatsResponse)
            } else reject(err("server/no-content"))
         } catch { reject(err("failed to fetch")) }
      })
   }

   public getGroupChats = (uid: string): Promise<ChatsResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentData = this.db.collection("group-member")
               .where("user_id", "==", uid)

            const snapshot: QuerySnapshot = await docRef.get()

            const chats: ChatSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
               const data: DocumentData[string] = await doc.data()

               const docRef: DocumentData = await this.db.collection("groups").doc(data.group_id).get()
               const dData: DocumentData = await docRef.data()

               const pfp: string = dData.pfp
               const name: string = dData.name
               const latest_message: string = await this.getLatestMessage()
               const unreaded_messages: number = 0 //TODO

               return {
                  name,
                  pfp,
                  latest_message,
                  unreaded_messages
               }
            }))

            if (chats.length > 0) {
               const chatsResponse: ChatsResponse = {
                  chats: { ...chats }
               }
               resolve(chatsResponse)
            } else reject(err("server/no-content"))
         } catch { reject(err("failato")) }
      })
   }

   public getLatestMessage = (): Promise<string> => {
      return new Promise((resolve, reject) => {
         resolve("")
      })
   }

   public getPersonalChatInfo = (uid: string, chatId: string): Promise<PersonalChatInfoResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentData = this.db.collection("users-chats")
               .where("chat_id", "==", chatId)
               .where("user_id", "!=", uid)
               .limit(1)

            const snapshot: DocumentData = await docRef.get()
            if (!snapshot.empty) {
               const userSchema: UserSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
                  const data: DocumentData[string] = doc.data()
                  const userSchema: UserSchema = await this.user.getUserDatafromUID(data.user_id)

                  return userSchema
               }))
               const personalChatInfoResponse: PersonalChatInfoResponse = {
                  user_data: { ...userSchema[0] }
               }
               resolve(personalChatInfoResponse)
            } else reject(err("no buono"))
         } catch { reject(err("no buono")) }
      })
   }

   public getGroupChatInfo = (uid: string, groupId: string): Promise<GroupChatInfoResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const queryRef: Query = this.db.collection("group-member")
               .where("group_id", "==", groupId)
               .where("user_id", "==", uid)

            const snapshot: QuerySnapshot = await queryRef.get()
            if (!snapshot.empty) {
               const docRef: DocumentData = await this.db.collection("groups").doc(groupId).get()
               const data: DocumentData[string] = await docRef.data()

               const membersRef: Query = this.db.collection("group-member")
                  .where("group_id", "==", docRef.id)

               const snapshot: QuerySnapshot = await membersRef.get()
               const membersName: string[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
                  const data: DocumentData[string] = await doc.data()
                  const uid: string = data.user_id
                  const userSchema: UserSchema = await this.user.getUserDatafromUID(uid)

                  return userSchema.name
               }))

               const groupChatInfoResponse: GroupChatInfoResponse = {
                  pfp: data.pfp,
                  name: data.name,
                  members_name: membersName
               }
               resolve(groupChatInfoResponse)
            } else reject(err("non hai accesso"))
         } catch { reject(err("no buono")) }
      })
   }

   public sendNotification = (receivers: string[]): Promise<null> => {
      return new Promise((resolve, reject) => { //TODO
         resolve(null)
      })
   }

   public uploadChatMessage = (uid: string, chatId: string, text?: string, type?: string, content?: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("messages").doc() //set the docRef to messages

            await docRef.set({ //set the message information in firestore
               owner: uid,
               created_at: Date.now(), //unix format
               chat_id: chatId,
               opened: false
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

   public openedMessages = (uid: string, chatId: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         const queryRef: Query = this.db.collection("messages")
            .where("group_id", "==", chatId)
            .where("user_id", "==", uid)
            .where("opened", "==", false)
         resolve(null) //TODO

      })
   }
}
