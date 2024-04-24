import { err, firebase, firestorage, firestore } from "config"
import { DocumentData, DocumentReference, Firestore, Query, QuerySnapshot } from "firebase-admin/firestore"
import { UserService } from "services"
import { CommentSchema, CommentUploadResponse, ContentFetch, IdResponse, PostResponse, RootCommentSchema, SuccessResponse, UserSchema } from "types"

export default class ContentService {
   private db: Firestore
   private bucket
   private user: UserService

   constructor() {
      firebase()
      this.db = firestore()
      this.bucket = firestorage()
      this.user = new UserService()
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

   public fetchPosts = (uids: string[], lastPostId: string, personalUID: string): Promise<ContentFetch> => {
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
            const userSchema: UserSchema = await this.user.getUserDatafromUID(data.owner)
            const isLiked: boolean = await this.isLikedBy(id, personalUID)
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
            const userSchema: UserSchema = await this.user.getUserDatafromUID(data.owner)
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
            const userSchema: UserSchema = await this.user.getUserDatafromUID(data.owner)

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

   public getPost = (personalUID: string, postId: string): Promise<PostResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentData = await this.db.collection("posts").doc(postId).get()
            const doc: DocumentData = await docRef.data()
            const id: string = docRef.id

            const userSchema: UserSchema = await this.user.getUserDatafromUID(doc.owner)
            const isLiked: boolean = await this.isLikedBy(id, personalUID)
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

            const leafsRef: Query = this.db.collection("comments").where("root", "==", commentId)
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

}
