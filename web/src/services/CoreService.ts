import { supernova } from "algorithms"
import { err, firebase, firestorage, firestore, neo } from "config"
import { DocumentData, DocumentReference, Firestore, Query, QuerySnapshot } from "firebase-admin/firestore"
import { QueryResult, Session } from "neo4j-driver"
import { ValidationService } from "services"
import { ChatSchema, ChatsResponse, CommentSchema, CommentUploadResponse, ContentFetch, GroupChatInfoResponse, IdResponse, MessageSchema, PersonalChatInfoResponse, PostResponse, RootCommentSchema, SuccessResponse, SupernovaResponse, UserSchema } from "types"

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
            const data: DocumentData[string] = doc.data()

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
            resolve(userSchema)
         } catch { reject(err("server/user-not-found")) }
      })
   }

   public getUidFromUserData = async (username: string): Promise<string> => { //retrieve uid based from the username
      return new Promise((resolve, reject) => {
         const usersRef: Query = this.db.collection("users")
            .where("username", "==", username)

         usersRef.get().then((snapshot: QuerySnapshot) => { //retrieve documents where the username is equal to the username param
            if (!snapshot.empty) {
               snapshot.forEach((doc) => {
                  const uid = doc.id
                  resolve(uid) //return the uid of the username
               })
            } else reject(err("server/user-not-found"))
         })
      })
   }

   public createUserDocument = (uid: string, username: string, bday: number, pfp?: string): Promise<UserSchema> => {
      return new Promise(async (resolve, reject) => {
         const docRef: DocumentReference = this.db.collection("users").doc(uid)
         const name: string = username.substring(1) //remove the "@" from the username

         if (!(await docRef.get()).exists) { //check if the user is already registered to prevent rewrites
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
               resolve(userSchema)
            } catch (error) { reject(error) }
         } else reject(err("auth/user-already-exists"))
      })
   }

   public createUserNode = (uid: string, interests: string[]): Promise<null> => {
      return new Promise(async (resolve) => {
         const neo4j: Session = neo()
         const query = `MERGE (:User {name:'${uid}', interests:'${interests}'})` //create a new node in neo4j
         await neo4j.executeWrite(tx => tx.run(query))
         resolve(null)
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

   public getPostCount = (uid: string): Promise<number> => { //get the snapshot size of all the posts where uid is equal to the owner
      return new Promise(async (resolve) => {
         const postsRef: Query = this.db.collection("posts")
            .where("owner", "==", uid)

         const snapshot: QuerySnapshot = await postsRef.get()
         resolve(snapshot.size)
      })
   }

   public getMeteorCount = (uid: string): Promise<number> => {
      return new Promise((resolve, reject) => {
         //TODO  @TheInfernalNick
         resolve(0)
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
            resolve(tempArray)
         else reject(err("server/no-friends"))
      })
   }

   public patchUserInfo = (uid: string, userSchema: UserSchema): Promise<IdResponse> => {
      return new Promise(async (resolve) => {
         const docRef: DocumentReference = this.db.collection("users").doc(uid)
         docRef.set({ ...userSchema })

         const query: string = `MATCH (u:User) where u.name = '${uid}' SET u.interests = '${userSchema.interests}'` //sets everything that can be changed
         await neo().executeWrite(tx => tx.run(query))

         const id: string = docRef.id
         const idResponse: IdResponse = {
            id
         }
         resolve(idResponse)
      })
   }

   public deleteUser = (uid: string): Promise<string> => {
      return new Promise(async (resolve, reject) => {
         try { //deletes the user reference and sessionReference in firebase and deletes the note in neo4j
            //firebase
            const userRef: DocumentReference = this.db.collection("users").doc(uid)
            const sessionRef: DocumentReference = this.db.collection("sessions").doc(uid)

            userRef.delete()
            sessionRef.delete()

            //neo4j
            const query: string = `MATCH (u:User) where u.name = '${uid}' DETACH DELETE u`
            const result: QueryResult = await neo().executeWrite(tx => tx.run(query))

            resolve(uid)
         } catch { reject(err("server/unauthorized")) }
      })

   }

   public removeBatch = (type: string, uid: string): Promise<null> => {
      return new Promise(async (resolve) => {
         const postsRef: Query = this.db.collection(`${type}`)
            .where("owner", "==", uid)

         const snapshot: QuerySnapshot = await postsRef.get()

         const batch = this.db.batch()
         snapshot.docs.forEach((doc) => { batch.delete(doc.ref) }) //removes all the posts of the user in one batch to dont overload firebase

         await batch.commit()

         if (snapshot.size === 0)
            resolve(null)

         process.nextTick(() => { this.removeBatch(type, uid) })
      })
   }

   public setRandomFriendCode = (uid: string, friendCode: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const friendCodeTimer: number = Date.now() + 60000
         const query: string = `MATCH (u:User) where u.name = '${uid}' SET u.friendCode = '${friendCode}', u.friendCodeTime = '${friendCodeTimer}'` //sets the random number to myself in neo
         await neo().executeWrite(tx => tx.run(query))

         resolve(friendCodeTimer)
      })
   }

   public findRandomFriendCode = (uid: string, friendCode: string): Promise<string | null> => {
      return new Promise(async (resolve) => {
         const friendCodeRequest: number = Date.now()
         const queryXFriend: string = `MATCH (u:User{friendCode : '${friendCode}'}), (t:User{name : "${uid}"}) WHERE u.friendCodeTime >=  "${friendCodeRequest}" MERGE (u)-[:Friend]-(t)` //sets the friend connection
         await neo().executeWrite(tx => tx.run(queryXFriend))

         const queryXUser: string = `MATCH (u:User{friendCode : '${friendCode}'}) RETURN u.name` // Searches for the name of the friend which i scanned the code
         const nameResult: QueryResult = await neo().executeRead(tx => tx.run(queryXUser))
         const name: string[] = nameResult.records.map((row: any) => row.get("u.name"))

         const queryXConfirm: string = `OPTIONAL MATCH p = (u:User {name : "${uid}"}) - [:Friend] - (t:User {name:"${name}"}) RETURN p` //Checks if it created the connection, if it doesnt returns null
         const confirmResult: QueryResult = await neo().executeRead(tx => tx.run(queryXConfirm))
         const confirm: string[] = confirmResult.records.map((row: any) => row.get("p"))
         if (confirm[0] === null) resolve(null)
         else resolve(name[0])
      })
   }

   //Setta l'amicizia tramite la funzione di supernova, deve essere chiamata solamente dal cron job
   public setSupernovaFriendship = (username: string): Promise<string> => {
      return new Promise(async (res, rej) => {
         supernova(username).then(async (string: string) => {
            const friendUsername = string
            const querySupernovaBinding: string = `MATCH (u:User {name : "${username}"}), (t:User {name : "${friendUsername}"}) MERGE (u)-[r:supernovaBind]-(t) SET r.time = ${Date.now()}`

            const result: QueryResult = await neo().executeWrite(tx => tx.run(querySupernovaBinding))
            const relationshipCode: string[] = result.records.map((row: any) => row.get("r.id"))
            return res(relationshipCode[0])
         })
            .catch((error) => {
               if (error.message === "User not found") {
                  return rej(err("User not found"))
               } else if (error.message === "Impossible to find new friends") {
                  return rej(err("Impossible to find new friends"))
               }
            })

      })
   }

   //Controlla lo stato dell'amicizia supernova, se nessuno dei due ha accettato l'amicizia, se uno solo ha accettato l'amicizia o se uno dei due l'ha rifiutata
   public checkSupernovaFriendship = (username: string): Promise<SupernovaResponse> => {
      return new Promise(async (res, rej) => {
         const querySupernovaBinding: string = `OPTIONAL MATCH (u:User {name : "${username}"})-[r:supernovaBind]-(t:User) RETURN t.name,r UNION OPTIONAL MATCH (u:User {name : "${username}"})-[r:oneWaysupernovaBind]-(t:User) RETURN t.name,r UNION OPTIONAL MATCH (u:User {name : "${username}"})-[r:RefusedsupernovaBind]-(t:User) RETURN t.name,r`

         const resultFriend: QueryResult = await neo().executeRead(tx => tx.run(querySupernovaBinding))
         let friendName: string = ""
         let status: any = ""
         let oneway: string = ""

         resultFriend.records.forEach(record => {
            if (record.get("t.name") != null) {
               friendName = record.get("t.name")
               status = record.get("r")
               oneway = status.properties["oneway"]
            }
         })
         if (status.type === "" || undefined)
            return rej(err("No binding found"))

         if (friendName == "") {
            return rej(err("No Supernova")) //This is given when there is no supernova associated at the user
         } else {
            const returnValue: SupernovaResponse = { username: friendName, status: status.type, oneway: oneway }
            return res(returnValue)
         }
      })
   }

   public oneWaySupernovaFriendship = (username: string, supernovaState: SupernovaResponse, accepted: boolean): Promise<string> => {
      return new Promise(async (res, rej) => {
         if (supernovaState.status === "supernovaBind" && accepted === true) { // Se è stato trovato il binding di supernova e lo accetto
            const querySupernovaOneWaySetter: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:supernovaBind]-(t:User) DELETE r MERGE (u)-[d:oneWaysupernovaBind]-(t) SET d.oneway = "${username}"`
            await neo().executeWrite(tx => tx.run(querySupernovaOneWaySetter))
            return res("One way Binding Created")
         } else if (supernovaState.status === "oneWaysupernovaBind" && supernovaState.oneway === username) { // Se trovo che ho già accettato la supernova
            return rej(err("Already accepted friendship"))
         } else if (supernovaState.status === "refusedSupernova") { // Se trovo la relazione rifiutata
            return rej(err("Refused Supernova"))
         } else if (supernovaState.status === "oneWaysupernovaBind" && supernovaState.oneway != username && accepted) { // Se trovo che è già stato accettato il supernova dall'altra persona
            const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:Friend]-(t)`
            await neo().executeWrite(tx => tx.run(queryFriendshipCreated))
            return res("Friendship Created")
         } else if (supernovaState.status === "oneWaysupernovaBind" && supernovaState.oneway != username && !accepted) { // Se è già stata accettata la supernova e non sono io e la rifiuto
            const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:refusedSupernova]-(t)`
            await neo().executeWrite(tx => tx.run(queryFriendshipCreated))
            return res("Supernova Blocked")
         } else if (supernovaState.status === "supernovaBind" && !accepted) { // Se è stato creato un supernova binding e non lo accetto
            const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:refusedSupernova]-(t)`
            await neo().executeWrite(tx => tx.run(queryFriendshipCreated))
            return res("Supernova Blocked")
         }
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
                  )
                     .then(results => {
                        results.forEach(result => { // push the result of each promise (the generated URL) into the urls array
                           urls.push(result[0])
                        })
                        resolve(urls[Math.floor(Math.random() * urls.length)]) // resolve the promise with a random URL from the urls array
                     })
               }
            })
         } catch { reject(err("server/no-content")) }
      })
   }

   public fetchPosts = (uids: string[], personalUid: string, lastPostId?: string,): Promise<ContentFetch> => {
      const limit: number = 5

      return new Promise(async (resolve, reject) => {
         let docRef: Query = this.db.collection("posts")
            .where("owner", "in", uids)
            .orderBy("created_at", "desc")
            .limit(limit)

         if (lastPostId) {
            const lastDoc: DocumentData = await this.db.collection("posts").doc(lastPostId).get()
            docRef = docRef.startAfter(lastDoc) // add the start after if is a next page request
         }

         const snapshot: DocumentData = await docRef.get()

         const content: PostResponse[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const id: string = doc.id
            const data: DocumentData[string] = doc.data()
            const userSchema: UserSchema = await this.getUserDataFromUid(data.owner)
            const isLiked: boolean = await this.isLikedBy(id, personalUid)
            const likes: number = await this.getLikesNumber(id)
            const comments: number = await this.getRootsCommentsNumber(doc.id)

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
            resolve(contentFetch)
         } else
            reject(err("server/no-content"))
      })
   }

   public isLikedBy = (postId: string, uid: string): Promise<boolean> => {
      return new Promise(async (resolve) => {
         const snapshot: QuerySnapshot = await this.db.collection("likes")
            .where("liker", "==", uid)
            .where("post_id", "==", postId)
            .get()

         resolve(!snapshot.empty)
      })
   }

   public getLikesNumber = (postId: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const queryRef: Query = this.db.collection("likes")
            .where("post_id", "==", postId)

         const snapshot = await queryRef.count().get()
         resolve(snapshot.data().count)
      })
   }

   public getRootsCommentsNumber = (postId: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const queryRef: Query = this.db.collection("comments")
            .where("post_id", "==", postId)

         const snapshot = await queryRef.count().get()
         resolve(snapshot.data().count)
      })
   }

   public getLeafsCommentsNumber = (rootId: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const queryRef: Query = this.db.collection("comments")
            .where("root_id", "==", rootId)

         const snapshot = await queryRef.count().get()
         resolve(snapshot.data().count)
      })
   }

   public fetchRootComments = (postId: string, lastRootCommentId: string): Promise<ContentFetch> => {
      const limit: number = 5

      return new Promise(async (resolve, reject) => {
         let docRef: Query = this.db.collection("comments")
            .where("post_id", "==", postId)
            .where("root_id", "==", true)
            .orderBy("created_at", "desc")
            .limit(limit)

         if (lastRootCommentId) {
            const lastDoc: DocumentData = await this.db.collection("comments").doc(lastRootCommentId).get()
            docRef = docRef.startAfter(lastDoc) // add the start after if is a next page request
         }

         const snapshot: DocumentData = await docRef.get()

         const content: RootCommentSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const data: DocumentData[string] = doc.data()
            const userSchema: UserSchema = await this.getUserDataFromUid(data.owner)
            const leafs: number = await this.getLeafsCommentsNumber(doc.id)

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
            resolve(contentFetch)
         } else
            reject(err("server/no-content"))
      })
   }

   public fetchLeafsComments = (rootId: string, lastLeafCommentId: string): Promise<ContentFetch> => {
      const limit: number = 5

      return new Promise(async (resolve, reject) => {
         let docRef: Query = this.db.collection("comments")
            .where("root_id", "==", rootId)
            .orderBy("created_at", "desc")
            .limit(limit)

         if (lastLeafCommentId) {
            const lastDoc: DocumentData = await this.db.collection("comments").doc(lastLeafCommentId).get()
            docRef = docRef.startAfter(lastDoc) // add the start after if is a next page request
         }

         const snapshot: DocumentData = await docRef.get()

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
            resolve(contentFetch)
         } else
            reject(err("server/no-content"))
      })
   }

   public uploadPost = (uid: string, text?: string, type?: string, content?: string): Promise<IdResponse> => {
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
            resolve(idResponse)
         } catch { reject(err("server/upload-failed")) }
      })
   }

   public getPost = (personalUid: string, postId: string): Promise<PostResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentData = await this.db.collection("posts").doc(postId).get()
            const doc: DocumentData = await docRef.data()
            const id: string = docRef.id

            const userSchema: UserSchema = await this.getUserDataFromUid(doc.owner)
            const isLiked: boolean = await this.isLikedBy(id, personalUid)
            const likesNumber: number = await this.getLikesNumber(id)
            const commentsNumber: number = await this.getRootsCommentsNumber(id)

            const post: PostResponse = {
               id: id,
               created_at: doc.created_at,
               text: doc.text,
               type: doc.type,
               content: doc.content,
               likes: likesNumber,
               comments: commentsNumber,
               is_liked: isLiked,
               user_data: { ...userSchema },
            }

            resolve(post)
         } catch { reject(err("server/post-not-found")) }
      })
   }

   public uploadComment = (uid: string, rootId: string, postId: string, content: string): Promise<CommentUploadResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("comments").doc() //set the docRef to comments
            let root: string | boolean = ""

            if (rootId)
               root = rootId
            else
               root = true //if the post has no root, set the root to true, so the comment is not a response comment

            await docRef.set({ //set the comment information in firestore
               owner: uid,
               root_id: root,
               content: content,
               post_id: postId,
               created_at: Date.now() //unix format
            })

            const comment_id: string = docRef.id
            const commentUploadResponse: CommentUploadResponse = {
               comment_id
            }

            resolve(commentUploadResponse)
         } catch { reject(err("server/upload-failed")) }
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
            resolve(idResponse)
         } catch { reject(err("server/update-failed")) }
      })
   }

   public deletePost = (postId: string): Promise<IdResponse> => {
      return new Promise((resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("posts").doc(postId)
            docRef.delete()

            const id = docRef.id
            const idResponse: IdResponse = {
               id
            }
            resolve(idResponse)
         } catch { reject(err("server/delete-failed")) }
      })
   }

   public getPostOwner = (postId: string): Promise<string> => {
      return new Promise(async (resolve) => {
         const docRef: DocumentReference = this.db.collection("posts").doc(postId)
         const doc: DocumentData = await docRef.get()

         resolve(doc.data().owner)
      })
   }

   public deleteComment = (commentId: string): Promise<SuccessResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("comments").doc(commentId)

            const leafsRef: Query = this.db.collection("comments")
               .where("root_id", "==", commentId)

            const snapshot: QuerySnapshot = await leafsRef.get()

            const batch = this.db.batch()
            snapshot.docs.forEach((doc) => { batch.delete(doc.ref) })

            batch.delete(docRef)
            await batch.commit()

            const successResponse: SuccessResponse = {
               success: true
            }

            resolve(successResponse)
         } catch { reject(err("server/delete-failed")) }
      })
   }

   public updateLike = (postId: string, uid: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("likes").doc(uid + postId)

            if (!(await docRef.get()).exists) {
               this.addLike(postId, uid).then((id: string) => {
                  const idResponse: IdResponse = {
                     id
                  }

                  resolve(idResponse)
               })
            } else {
               this.removeLike(postId, uid).then((id: string) => {
                  const idResponse: IdResponse = {
                     id
                  }

                  resolve(idResponse)
               })
            }
         } catch { reject(err("server/update-failed")) }
      })
   }

   public addLike = (postId: string, uid: string): Promise<string> => {
      return new Promise(async (resolve) => {
         const docRef: DocumentReference = this.db.collection("likes").doc(uid + postId)

         await docRef.set({
            liker: uid,
            post_id: postId
         })
         resolve(docRef.id)
      })
   }

   public removeLike = (postId: string, uid: string): Promise<string> => {
      return new Promise(async (resolve) => {
         const docRef: DocumentReference = this.db.collection("likes").doc(uid + postId)
         docRef.delete()
         resolve(docRef.id)
      })
   }

   public newPersonalChat = (uid: string, receiverUsername: string): Promise<IdResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const receiverUid: string = await this.getUidFromUserData(receiverUsername)
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
               user_id: receiverUid,
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
            pfp = pfp ? pfp : await this.randomPicture("default/groups")

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
                  const userId: string = await this.getUidFromUserData(member)

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
                  const userSchema: UserSchema = await this.getUserDataFromUid(data.user_id)

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
                  const userSchema: UserSchema = await this.getUserDataFromUid(uid)

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

   public getChatMessages = (uid: string, chatId: string, lastMessageId?: string): Promise<ContentFetch> => {
      const limit: number = 7

      return new Promise(async (resolve, reject) => {
         let docRef: Query = this.db.collection("messages")
            .where("chat_id", "==", chatId)
            .orderBy("created_at", "desc")
            .limit(limit)

         if (lastMessageId) {
            const lastDoc: DocumentData = await this.db.collection("messages").doc(lastMessageId).get()
            docRef = docRef.startAfter(lastDoc) // add the start after if is a next page request
         }

         const snapshot: DocumentData = await docRef.get()

         const content: MessageSchema[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const id: string = doc.id
            const data: DocumentData[string] = doc.data()
            const owner: string = data.owner
            const userSchema: UserSchema = await this.getUserDataFromUid(owner)

            return {
               id: id,
               personal: uid === owner,
               created_at: data.created_at,
               text: data.text,
               type: data.type,
               content: data.content,
               pfp: userSchema.pfp,
               username: userSchema.username
            }
         }))

         if (content.length > 0) {
            const last_doc_id: string = snapshot.docs[snapshot.docs.length - 1].ref.id
            const contentFetch: ContentFetch = {
               content,
               last_doc_id
            }
            resolve(contentFetch)
         } else
            reject(err("server/no-content"))
      })
   }
}
