import { err, firebase, firestorage, firestore, neo } from "config"
import { DocumentData, DocumentReference, DocumentSnapshot, Firestore, Query, QuerySnapshot, WriteBatch } from "firebase-admin/firestore"
import { QueryResult, Session } from "neo4j-driver"
import { ValidationService } from "services"
import { ChatSchema, ChatsResponse, CommentSchema, ContentFetch, GroupChatInfoResponse, IdResponse, LatestMessageSchema, MessageSchema, NumberResponse, PersonalChatInfoResponse, PostResponse, RootCommentSchema, SuccessResponse, UserSchema } from "types"

export default class CoreService {
   private db: Firestore
   private valid: ValidationService
   private bucket

   constructor() {
      firebase()
      this.db = firestore()
      this.bucket = firestorage()
      this.valid = new ValidationService()
   }

   public getUserDataFromUid = async (uid: string): Promise<UserSchema> => { //retrieve user informations based from the uid
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("users").doc(uid)
            const doc: DocumentData = await docRef.get()
            const data: DocumentData[string] = await doc.data()

            const username: string = data?.username
            const name: string = data?.name
            const pfp: string = data?.pfp
            const bday: number = data?.bday

            const query: string = `MATCH (u:User) where u.name = '${uid}' RETURN u.interests` //retrieves the interests from neo4j for a specific user
            const result: QueryResult = await neo().executeRead(tx => tx.run(query))
            const results: string[] = result.records.map((row: any) => row.get("u.interests"))
            const interests: string[] = results[0].split(",")

            const userSchema: UserSchema = {
               username,
               name,
               pfp,
               bday,
               interests
            }
            return resolve(userSchema)
         } catch { return reject(err("server/user-not-found")) }
      })
   }

   public getUidFromUserData = async (username: string): Promise<string> => { //retrieve uid based from the username
      return new Promise(async (resolve, reject) => {
         try {
            const snapshot: QuerySnapshot = await this.db.collection("users")
               .where("username", "==", username)
               .limit(1)
               .get()

            if (!snapshot.empty) { //retrieve documents where the username is equal to the username param
               const uid: string[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
                  return doc.ref.id
               }))
               return resolve(uid[0]) //return the uid of the username
            }
         } catch { return reject(err("server/user-not-found")) }
      })
   }

   public newUserDocument = (uid: string, username: string, bday: number, pfp?: string): Promise<UserSchema> => {
      return new Promise(async (resolve, reject) => {
         const docRef: DocumentReference = this.db.collection("users").doc(uid)
         const name: string = username.substring(1) //remove the "@" from the username
         const snapshot: DocumentSnapshot = await docRef.get()

         if (!snapshot.exists) { //check if the user is already registered to prevent rewrites
            try {
               if (pfp) await this.valid.mediaValidation(pfp)
               pfp = pfp ? pfp : await this.randomPicture("default/personal") //set the pfp url to the one sent from the client, or if is null, select a random one

               await docRef.set({ //set the user data into the doc
                  username: username,
                  name: name,
                  pfp: pfp,
                  bday: bday
               })

               const userSchema: UserSchema = { username, name, pfp, bday }
               return resolve(userSchema)
            } catch (error) { return reject(error) }
         } else return reject(err("auth/user-already-exists"))
      })
   }

   public newUserNode = (uid: string, interests: string[]): Promise<void> => {
      return new Promise(async (resolve) => {
         const neo4j: Session = neo()
         const query = `MERGE (:User {name:'${uid}', interests:'${interests}'})` //create a new node in neo4j
         await neo4j.executeWrite(tx => tx.run(query))
         resolve()
      })
   }

   public getFriendsCount = (uid: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const query: string = `MATCH (u:User)-[:Friend]-(t:User) where u.name = '${uid}' RETURN t`
         const resultQueryFriends = await neo().executeWrite(tx => tx.run(query))
         const friends = resultQueryFriends.records.map(row => row.get("t"))

         resolve(friends.length)
      })
   }

   public getMeteorCount = (uid: string): Promise<number> => {
      return new Promise((resolve, reject) => {
         //TODO  @TheInfernalNick
         return resolve(0)
      })
   }

   public getFriendList = (uid: string): Promise<string[]> => {
      return new Promise(async (resolve, reject) => {
         const tempArray: string[] = []
         const queryFriends: string = `MATCH (n:User)-[:Friend]-(p:User) where n.name = '${uid}' RETURN p`
         const resultMap: QueryResult = await neo().executeRead(tx => tx.run(queryFriends))
         const uids = resultMap.records.map((row: any) => row.get("p"))
         uids.forEach((element: any) => {
            tempArray.push(element.properties["name"])
         })

         if (tempArray.length > 0)
            return resolve(tempArray)
         else return reject(err("server/no-friends"))
      })
   }

   public updateUserInfo = (uid: string, userSchema: UserSchema): Promise<IdResponse> => {
      return new Promise(async (resolve) => {
         const docRef: DocumentReference = this.db.collection("users").doc(uid)

         await docRef.set({
            ...userSchema
         })

         const query: string = `MATCH (u:User) where u.name = '${uid}' SET u.interests = '${userSchema.interests}'` //sets everything that can be changed
         await neo().executeWrite(tx => tx.run(query))

         const id: string = docRef.id
         const idResponse: IdResponse = {
            id
         }
         return resolve(idResponse)
      })
   }

   public deleteUser = (uid: string): Promise<string> => {
      return new Promise(async (resolve, reject) => {
         try { //deletes the user reference and session in firebase and deletes the note in neo4j
            //firebase
            this.delete(uid, "users")
            this.delete(uid, "sessions")

            //neo4j
            const query: string = `MATCH (u:User) where u.name = '${uid}' DETACH DELETE u`
            await neo().executeWrite(tx => tx.run(query))

            return resolve(uid)
         } catch { return reject(err("server/unauthorized")) }
      })
   }

   public removeBatch = (type: string, uid: string): Promise<void> => {
      return new Promise(async (resolve) => {
         const snapshot: QuerySnapshot = await this.db.collection(type)
            .where("owner", "==", uid)
            .get()

         const batch: WriteBatch = this.db.batch()
         snapshot.docs.forEach((doc: DocumentData) => {
            batch.delete(doc.ref)
         }) //removes all the posts of the user in one batch to dont overload firebase

         await batch.commit()

         if (snapshot.size === 0)
            return resolve()

         process.nextTick(() => {
            this.removeBatch(type, uid)
         })
      })
   }

   public setRandomFriendCode = (uid: string, friendCode: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const friendCodeTimer: number = Date.now() + 60000
         const query: string = `MATCH (u:User) where u.name = '${uid}' SET u.friendCode = '${friendCode}', u.friendCodeTime = '${friendCodeTimer}'` //sets the random number to myself in neo
         await neo().executeWrite(tx => tx.run(query))

         return resolve(friendCodeTimer)
      })
   }

   public findRandomFriendCode = (uid: string, friendCode: string): Promise<UserSchema> => {
      return new Promise(async (resolve) => { //TODO AL POSTO DI TORNARE NULL USA IL REJECT ERR
         const friendCodeRequest: number = Date.now() //TODO RITORNA UN TIPO USERSCHEMA
         const queryXFriend: string = `MATCH (u:User{friendCode : '${friendCode}'}), (t:User{name : "${uid}"}) WHERE u.friendCodeTime >=  "${friendCodeRequest}" MERGE (u)-[:Friend]-(t)` //sets the friend connection
         await neo().executeWrite(tx => tx.run(queryXFriend))

         const queryXUser: string = `MATCH (u:User{friendCode : '${friendCode}'}) RETURN u.name` // Searches for the name of the friend which i scanned the code
         const nameResult: QueryResult = await neo().executeRead(tx => tx.run(queryXUser))
         const name: string[] = nameResult.records.map((row: any) => row.get("u.name"))

         const queryXConfirm: string = `OPTIONAL MATCH p = (u:User {name : "${uid}"}) - [:Friend] - (t:User {name:"${name}"}) RETURN p` //Checks if it created the connection, if it doesnt returns null
         const confirmResult: QueryResult = await neo().executeRead(tx => tx.run(queryXConfirm))
         const confirm: string[] = confirmResult.records.map((row: any) => row.get("p"))
         // if (confirm[0] === null) return resolve(null)
         // else return resolve(name[0])
      })
   }

   public randomPicture = (prefix: string): Promise<string> => {
      return new Promise((resolve, reject) => {
         try {
            this.bucket.getFiles({ prefix: prefix }, (_, files) => { // get the files from the bucket with the defined prefix
               const urls: string[] = []
               if (files) {
                  files.splice(0, 1) // remove the first file from the files array

                  Promise.all(
                     files.map(file => // map over the files array and create a new promise for each file
                        file.getSignedUrl({
                           action: "read",
                           expires: Date.now() + 30 * 24 * 60 * 60 * 1000 * 12 * 10, // expiration set to 10 years from now
                        })
                     )
                  ).then(results => {
                     results.forEach(result => { // push the result of each promise (the generated URL) into the urls array
                        urls.push(result[0])
                     })
                     return resolve(urls[Math.floor(Math.random() * urls.length)]) // resolve the promise with a random URL from the urls array
                  })
               } else return reject(err("no files error"))
            })
         } catch { return reject(err("server/no-content")) }
      })
   }

   public isLiked = (postId: string, uid: string): Promise<boolean> => {
      return new Promise(async (resolve) => {
         const snapshot: QuerySnapshot = await this.db.collection("likes")
            .where("liker", "==", uid)
            .where("post_id", "==", postId)
            .get()

         return resolve(!snapshot.empty)
      })
   }

   public counter = (id: string, path: string, reference: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const snapshot = await this.db.collection(path)
            .where(reference, "==", id)
            .count()
            .get()

         const data = snapshot.data()
         return resolve(data.count)
      })
   }

   public fetchRootComments = (postId: string, lastRootCommentId: string): Promise<ContentFetch> => {
      const limit: number = 5

      return new Promise(async (resolve, reject) => {
         let query: Query = this.db.collection("comments")
            .where("post_id", "==", postId)
            .where("root_id", "==", true)
            .orderBy("created_at", "desc")
            .limit(limit)

         if (lastRootCommentId) {
            const lastDoc: DocumentData = await this.db.collection("comments")
               .doc(lastRootCommentId)
               .get()
            query = query.startAfter(lastDoc) // add the start after if is a next page request
         }

         const snapshot: QuerySnapshot = await query.get()

         const content: RootCommentSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const data: DocumentData[string] = doc.data()
            const userSchema: UserSchema = await this.getUserDataFromUid(data.owner)
            const leafs: number = await this.counter(doc.id, "comments", "root_id")

            const comment: CommentSchema = {
               id: doc.id,
               created_at: data.created_at,
               content: data.content,
               user_data: { ...userSchema }
            }

            return {
               comment: { ...comment },
               leafs: leafs,
            }
         }))

         if (content.length > 0) {
            const last_doc_id: string = snapshot.docs[snapshot.docs.length - 1].ref.id
            const contentFetch: ContentFetch = { content, last_doc_id }
            return resolve(contentFetch)
         } else return reject(err("server/no-content"))
      })
   }

   public fetchLeafsComments = (rootId: string, lastLeafCommentId: string): Promise<ContentFetch> => {
      const limit: number = 5

      return new Promise(async (resolve, reject) => {
         let query: Query = this.db.collection("comments")
            .where("root_id", "==", rootId)
            .orderBy("created_at", "desc")
            .limit(limit)

         if (lastLeafCommentId) {
            const lastDoc: DocumentData = await this.db.collection("comments")
               .doc(lastLeafCommentId)
               .get()
            query = query.startAfter(lastDoc) // add the start after if is a next page request
         }

         const snapshot: QuerySnapshot = await query.get()

         const content: CommentSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const data: DocumentData[string] = doc.data()
            const userSchema: UserSchema = await this.getUserDataFromUid(data.owner)

            return {
               id: doc.id,
               created_at: doc.created_at,
               content: doc.content,
               user_data: { ...userSchema },
            }
         }))

         if (content.length > 0) {
            const last_doc_id: string = snapshot.docs[snapshot.docs.length - 1].ref.id
            const contentFetch: ContentFetch = {
               content,
               last_doc_id
            }
            return resolve(contentFetch)
         } else
            return reject(err("server/no-content"))
      })
   }

   public fetchPosts = (uids: string[], uid: string, lastPostId?: string,): Promise<ContentFetch> => {
      const limit: number = 5

      return new Promise(async (resolve, reject) => {
         let query: Query = this.db.collection("posts")
            .where("owner", "in", uids)
            .orderBy("created_at", "desc")
            .limit(limit)

         if (lastPostId) {
            const lastDoc: DocumentData = await this.db.collection("posts")
               .doc(lastPostId)
               .get()
            query = query.startAfter(lastDoc) // add the start after if is a next page request
         }

         const snapshot: QuerySnapshot = await query.get()

         const content: PostResponse[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const id: string = doc.id
            const data: DocumentData[string] = doc.data()
            const userSchema: UserSchema = await this.getUserDataFromUid(data.owner)
            const isLiked: boolean = await this.isLiked(id, uid)
            const likes: number = await this.counter(id, "likes", "post_id")
            const comments: number = await this.counter(id, "comments", "post_id")

            return {
               id: id,
               created_at: data.created_at,
               text: data.text,
               type: data.type,
               content: data.content,
               likes: likes,
               comments: comments,
               is_liked: isLiked,
               user_data: { ...userSchema }
            }
         }))

         if (content.length > 0) {
            const last_doc_id: string = snapshot.docs[snapshot.docs.length - 1].ref.id
            const contentFetch: ContentFetch = {
               content,
               last_doc_id
            }
            return resolve(contentFetch)
         } else return reject(err("server/no-content"))
      })
   }

   public newPost = (uid: string, text?: string, type?: string, content?: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("posts").doc() //set the docRef to posts

            await docRef.set({ //set the post information in firestore
               owner: uid,
               created_at: Date.now() //unix format
            })

            if (text) await docRef.update({ text: text })
            if (content) await docRef.update({ content: content, type: type })

            const id: string = docRef.id
            const idResponse: IdResponse = {
               id
            }
            return resolve(idResponse)
         } catch { return reject(err("server/new-failed")) }
      })
   }

   public getPost = (uid: string, postId: string): Promise<PostResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("posts").doc(postId)
            const doc: DocumentData = await docRef.get()
            const data: DocumentData = await doc.data()
            const id: string = docRef.id

            const userSchema: UserSchema = await this.getUserDataFromUid(data.owner)
            const isLiked: boolean = await this.isLiked(id, uid)
            const likes: number = await this.counter(id, "likes", "post_id")
            const comments: number = await this.counter(id, "comments", "post_id")

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
            }

            return resolve(post)
         } catch { return reject(err("server/post-not-found")) }
      })
   }

   public newComment = (uid: string, rootId: string, postId: string, content: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("comments").doc() //set the docRef to comments
            const root: string | boolean = rootId ? rootId : true //if the post has no root, set the root to true, so the comment is not a response comment

            await docRef.set({ //set the comment information in firestore
               owner: uid,
               root_id: root,
               content: content,
               post_id: postId,
               created_at: Date.now() //unix format
            })

            const id: string = docRef.id
            const idResponse: IdResponse = {
               id
            }
            return resolve(idResponse)
         } catch { return reject(err("server/new-failed")) }
      })
   }

   public updatePost = (postId: string, text?: string, content?: string, type?: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("posts").doc(postId)

            if (text) await docRef.update({ text: text })
            if (content) await docRef.update({ content: content, type: type })

            const id: string = docRef.id
            const idResponse: IdResponse = {
               id
            }
            return resolve(idResponse)
         } catch { return reject(err("server/update-failed")) }
      })
   }

   public delete = (reference: string, path: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection(path).doc(reference)
            await docRef.delete()

            const id = docRef.id
            const idResponse: IdResponse = {
               id
            }
            return resolve(idResponse)
         } catch { return reject(err("server/delete-failed")) }
      })
   }

   public getOwner = (id: string, path: string): Promise<string> => {
      return new Promise(async (resolve) => {
         const docRef: DocumentReference = this.db.collection(path).doc(id)
         const doc: DocumentData = await docRef.get()
         const data: DocumentData = await doc.data()

         return resolve(data?.owner)
      })
   }

   public deleteComment = (commentId: string): Promise<SuccessResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("comments").doc(commentId)
            const snapshot: QuerySnapshot = await this.db.collection("comments")
               .where("root_id", "==", commentId)
               .get()

            const batch: WriteBatch = this.db.batch()
            snapshot.docs.forEach((doc: DocumentData) => {
               batch.delete(doc.ref)
            })

            batch.delete(docRef)
            await batch.commit()

            const successResponse: SuccessResponse = {
               success: true
            }
            return resolve(successResponse)
         } catch { return reject(err("server/delete-failed")) }
      })
   }

   public updateLike = (postId: string, uid: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("likes").doc(uid + postId)
            const snapshot: DocumentSnapshot = await docRef.get()

            if (!snapshot.exists) {
               this.newLike(postId, uid).then((id: string) => {
                  const idResponse: IdResponse = {
                     id
                  }

                  resolve(idResponse)
               })
            } else return resolve(this.delete(uid + postId, "likes")) //remove the like
         } catch { return reject(err("server/update-failed")) }
      })
   }

   public newLike = (postId: string, uid: string): Promise<string> => {
      return new Promise(async (resolve) => {
         const docRef: DocumentReference = this.db.collection("likes").doc(uid + postId)

         await docRef.set({
            owner: uid,
            post_id: postId
         })
         return resolve(docRef.id)
      })
   }

   public newPersonalChat = (uid: string, receiverUid: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("personal-chats").doc() //set the docRef to chats

            await docRef.set({ //set the chat information in firestore
               created_at: Date.now(), //unix format
            })

            const id: string = docRef.id
            let memberRef: DocumentReference = this.db.collection("users-chats").doc()
            await memberRef.set({
               user_id: uid,
               chat_id: id
            })

            memberRef = this.db.collection("users-chats").doc()
            await memberRef.set({
               user_id: receiverUid,
               chat_id: id
            })

            const idResponse: IdResponse = {
               id
            }
            return resolve(idResponse)
         } catch { return reject(err("server/new-failed")) }
      })
   }

   public newGroupChat = async (uid: string, members: string[], name: string, pfp?: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            if (pfp) await this.valid.mediaValidation(pfp)
            pfp = pfp ? pfp : await this.randomPicture("default/groups")

            if (!name) return reject(err("no name"))

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

            await Promise.all(members.map(async (member: string) => {
               const memberRef: DocumentReference = this.db.collection("group-member").doc()

               await memberRef.set({ //set the group information in firestore
                  user_id: member,
                  group_id: id,
                  admin: false
               })
            }))

            const idResponse: IdResponse = {
               id
            }
            return resolve(idResponse)
         } catch { return reject(err(" failed")) }
      })
   }

   public getPersonalChats = (uid: string): Promise<ChatsResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const snapshot: QuerySnapshot = await this.db.collection("users-chats")
               .where("user_id", "==", uid)
               .get()

            const chats: ChatSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
               const data: DocumentData[string] = doc.data()
               const chat_id: string = data.chat_id
               const docRef: DocumentData = this.db.collection("users-chats")
                  .where("chat_id", "==", data.chat_id)
                  .where("user_id", "!=", uid)
                  .limit(1)

               const snapshot: QuerySnapshot = await docRef.get() //get the uid of receiver

               const receiverUid: string[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
                  const data: DocumentData[string] = doc.data()
                  const uid: string = data.user_id
                  return uid
               }))

               const userSchema: UserSchema = await this.getUserDataFromUid(receiverUid[0])

               const bdayTime: number = userSchema.bday!
               const date: Date = new Date(bdayTime * 1000)
               const day = date.getDate()
               const month = date.getMonth() + 1
               const bday: boolean = day === new Date().getDate() && month === new Date().getMonth()

               const name: string = userSchema.name
               const pfp: string = userSchema.pfp
               const unreaded_messages: number = await this.getChatUnreadedMessages(uid, data.chat_id)

               if (unreaded_messages > 0) {
                  return {
                     chat_id,
                     name,
                     pfp,
                     bday,
                     unreaded_messages
                  }
               } else {
                  const latest_message: LatestMessageSchema = await this.getLatestMessage(data.chat_id)
                  return {
                     chat_id,
                     name,
                     pfp,
                     bday,
                     latest_message
                  }
               }
            }))

            if (chats.length > 0) {
               const chatsResponse: ChatsResponse = {
                  chats: { ...chats }
               }
               return resolve(chatsResponse)
            } else return reject(err("server/no-content"))
         } catch (error) { return reject(error) }
      })
   }

   public getGroupChats = (uid: string): Promise<ChatsResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const snapshot: QuerySnapshot = await this.db.collection("group-member")
               .where("user_id", "==", uid)
               .get()

            const chats: ChatSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
               const data: DocumentData[string] = await doc.data()
               const docRef: DocumentData = await this.db.collection("groups").doc(data.group_id).get()
               const dData: DocumentData = await docRef.data()

               const chat_id: string = docRef.id
               const pfp: string = dData.pfp
               const name: string = dData.name

               const latest_message: LatestMessageSchema = await this.getLatestMessage(data.group_id)
               return {
                  chat_id,
                  name,
                  pfp,
                  latest_message
               }
            }))

            if (chats.length > 0) {
               const chatsResponse: ChatsResponse = {
                  chats: { ...chats }
               }
               return resolve(chatsResponse)
            } else return reject(err("server/no-content"))
         } catch (error) { return reject(error) }
      })
   }

   public getPersonalChatInfo = (uid: string, chatId: string): Promise<PersonalChatInfoResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const snapshot: DocumentData = await this.db.collection("users-chats")
               .where("chat_id", "==", chatId)
               .where("user_id", "!=", uid)
               .limit(1)
               .get()

            if (!snapshot.empty) {
               const userSchema: UserSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
                  const data: DocumentData[string] = doc.data()
                  const userSchema: UserSchema = await this.getUserDataFromUid(data.user_id)

                  return userSchema
               }))

               await this.setChatVisualizationOfMessages(uid, chatId)

               const personalChatInfoResponse: PersonalChatInfoResponse = {
                  user_data: { ...userSchema[0] }
               }
               return resolve(personalChatInfoResponse)
            } else return reject(err("no buono"))
         } catch (error) { return reject(error) }
      })
   }

   public getLatestMessage = (chatId: string): Promise<LatestMessageSchema> => {
      return new Promise(async (resolve) => {
         const snapshot = await this.db.collection("messages")
            .where("chat_id", "==", chatId)
            .orderBy("created_at", "desc")
            .limit(1)
            .get()

         const latest_message: LatestMessageSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const data: DocumentData[string] = await doc.data()
            const text: string = data.text
            const content: string = data.content
            const type: string = data.type

            if (text) {
               const content: string = text
               const type: string = "text"
               return {
                  content,
                  type
               }
            }

            return {
               content,
               type
            }
         }))

         return resolve(latest_message[0])
      })
   }

   public getChatUnreadedMessages = (uid: string, chatId: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const snapshot = await this.db.collection("opened-messages")
            .where("user_id", "==", uid)
            .where("chat_id", "==", chatId)
            .where("opened", "==", false)
            .count()
            .get()

         const data = snapshot.data()

         return resolve(data.count)
      })
   }

   public getGroupChatInfo = (uid: string, groupId: string): Promise<GroupChatInfoResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const snapshot: QuerySnapshot = await this.db.collection("group-member")
               .where("group_id", "==", groupId)
               .where("user_id", "==", uid)
               .get()

            if (!snapshot.empty) {
               const docRef: DocumentData = await this.db.collection("groups").doc(groupId).get()
               const data: DocumentData[string] = await docRef.data()

               const snapshot: QuerySnapshot = await this.db.collection("group-member")
                  .where("group_id", "==", docRef.id)
                  .get()

               const membersName: string[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
                  const data: DocumentData[string] = await doc.data()
                  const uid: string = data.user_id
                  const userSchema: UserSchema = await this.getUserDataFromUid(uid)

                  return userSchema.name
               }))

               const groupChatInfoResponse: GroupChatInfoResponse = {
                  pfp: data.pfp,
                  name: data.name,
                  members_name: membersName
               }
               return resolve(groupChatInfoResponse)
            } else return reject(err("non hai accesso"))
         } catch { return reject(err("no buono")) }
      })
   }

   public setChatVisualizationOfMessages = (uid: string, chatId: string): Promise<void> => {
      return new Promise(async (resolve) => {
         const snapshot: DocumentData = await this.db.collection("opened-messages")
            .where("chat_id", "==", chatId)
            .where("user_id", "!=", uid)
            .where("opened", "==", false)
            .get()

         await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const docRef: DocumentReference = doc.ref

            await docRef.update({
               opened: true
            })
            console.log(docRef.id);
         }))
         resolve()
      })
   }

   public getMembersUidsFromUsernames = (members: string[]): Promise<string[]> => {
      return new Promise(async (resolve, reject) => {
         try {
            const membersUids: string[] = await Promise.all(members.map(async (member: string) => {
               return await this.getUidFromUserData(member)
            }))
            return resolve(membersUids)
         } catch (error) { return reject(error) }
      })
   }

   public getMembersFromChatId = (uid: string, chatId: string): Promise<string[]> => {
      return new Promise(async (resolve) => {
         const snapshot: QuerySnapshot = await this.db.collection("users-chats")
            .where("chat_id", "==", chatId)
            .where("user_id", "!=", uid)
            .get()

         const members: string[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const data: DocumentData[string] = await doc.data()
            return data.user_id
         }))

         return resolve(members)
      })
   }

   public newChatMessage = (uid: string, chatId: string, members: string[], isGroup: boolean, text?: string, type?: string, content?: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            let docRef: DocumentReference = this.db.collection("messages").doc() //set the docRef to messages
            const id: string = docRef.id

            await docRef.set({ //set the message information in firestore
               owner: uid,
               created_at: Date.now(), //unix format
               chat_id: chatId
            })

            if (text) await docRef.update({ text: text })
            if (content) await docRef.update({ content: content, type: type })

            if (!isGroup) {
               members.forEach(async (memberId: string) => { //set if the message is opened
                  docRef = this.db.collection("opened-messages").doc()

                  await docRef.set({
                     user_id: memberId,
                     chat_id: chatId,
                     message_id: id,
                     opened: false
                  })
               })
            }

            const idResponse: IdResponse = {
               id
            }
            return resolve(idResponse)
         } catch { return reject(err("server/new-failed")) }
      })
   }

   public fetchChatMessages = (uid: string, chatId: string, isGroup: boolean, lastMessageId?: string): Promise<ContentFetch> => {
      const limit: number = 7

      return new Promise(async (resolve, reject) => {
         let query: Query = this.db.collection("messages")
            .where("chat_id", "==", chatId)
            .where("created_at", ">=", Date.now() - 24 * 60 * 60 * 1000) // 24h before
            .orderBy("created_at", "desc")
            .limit(limit)

         if (lastMessageId) {
            const lastDoc: DocumentData = await this.db.collection("messages").doc(lastMessageId).get()
            query = query.startAfter(lastDoc) // add the start after if is a next page request
         }

         const snapshot: QuerySnapshot = await query.get()

         const content: MessageSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const id: string = doc.id
            const data: DocumentData[string] = doc.data()
            const owner: string = data.owner
            const userSchema: UserSchema = await this.getUserDataFromUid(owner)
            const isOpened: boolean = isGroup ? false : await this.getIfMessageIsSeen(id, chatId, uid)

            return {
               id: id,
               personal: uid === owner,
               created_at: data.created_at,
               text: data.text,
               type: data.type,
               content: data.content,
               pfp: userSchema.pfp,
               username: userSchema.username,
               opened: isOpened
            }
         }))

         if (content.length > 0) {
            const last_doc_id: string = snapshot.docs[snapshot.docs.length - 1].ref.id
            const contentFetch: ContentFetch = {
               content,
               last_doc_id
            }
            return resolve(contentFetch)
         } else return reject(err("server/no-content"))
      })
   }

   public getIfMessageIsSeen = (messageId: string, chatId: string, uid: string): Promise<boolean> => {
      return new Promise(async (resolve) => {
         const snapshot = await this.db.collection("opened-messages")
            .where("user_id", "==", uid)
            .where("chat_id", "==", chatId)
            .where("message_id", "==", messageId)
            .limit(1)
            .get()

         await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const data: DocumentData[string] = await doc.data()

            return resolve(data.opened)
         }))
      })
   }

   public getUnreadedMessagesCount = (uid: string): Promise<NumberResponse> => {
      return new Promise(async (resolve) => {
         const snapshot = await this.db.collection("opened-messages")
            .where("opened", "==", false)
            .where("user_id", "==", uid)
            .count()
            .get()

         const data = snapshot.data()
         const number: number = data.count
         const numberResponse: NumberResponse = {
            number
         }
         return resolve(numberResponse)
      })
   }

   public sendNotification = (sender: string, receivers: string[], type: number): Promise<void> => {
      return new Promise((resolve, reject) => { //TODO
         return resolve()
      })
   }
}
