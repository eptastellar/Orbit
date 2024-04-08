import { err, firebase, firestorage, firestore } from "config"
import { DocumentData, DocumentReference, Firestore, Query, QuerySnapshot } from "firebase-admin/firestore"
import { ContentFetch, UserInfo } from "types"
import UserService from "./UserService"

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
            .orderBy("createdAt", "desc")
            .limit(limit)

         if (lastPostId) {
            const lastDoc: DocumentData = await this.db.collection("posts").doc(lastPostId).get()
            docRef = docRef.startAfter(lastDoc) // add the start after if is a next page request
         }

         const snapshot: DocumentData = await docRef.get()

         const posts: DocumentData[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const user: UserInfo = await this.user.getUserDatafromUID(doc.data().owner)
            const isLiked: boolean = await this.isLikedBy(doc.id, personalUID)

            return {
               id: doc.id,
               creation: doc.createTime.seconds,
               text: doc.data().text,
               type: doc.data().type,
               content: doc.data().content,
               likes_number: await this.getLikesNumber(doc.id),
               comments_number: await this.getRootsCommentsNumber(doc.id),
               is_liked: isLiked,
               user_data: {
                  username: user.username,
                  name: user.name,
                  pfp: user.pfp,
               },
            }
         }))

         if (posts.length > 0) {
            const lastDocId: string = snapshot.docs[snapshot.docs.length - 1].ref.id
            const content: DocumentData[] = posts
            const fetch: ContentFetch = { content, lastDocId }
            resolve(fetch)
         } else
            reject(err("server/no-content"))
      })
   }

   public isLikedBy = (postId: string, uid: string): Promise<boolean> => {
      return new Promise(async (resolve) => {
         const snapshot: QuerySnapshot = await this.db.collection("likes")
            .where("liker", "==", uid)
            .where("postId", "==", postId)
            .get()

         resolve(!snapshot.empty)
      })
   }

   public getLikesNumber = (postId: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const queryRef: Query = this.db.collection("likes")
            .where("postId", "==", postId)

         const snapshot = await queryRef.count().get()
         resolve(snapshot.data().count)
      })
   }

   public getRootsCommentsNumber = (postId: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const queryRef: Query = this.db.collection("comments")
            .where("postId", "==", postId)

         const snapshot = await queryRef.count().get()
         resolve(snapshot.data().count)
      })
   }

   public getLeafsCommentsNumber = (rootId: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const queryRef: Query = this.db.collection("comments")
            .where("root", "==", rootId)

         const snapshot = await queryRef.count().get()
         resolve(snapshot.data().count)
      })
   }

   public fetchRootComments = (postId: string, lastRootCommentId: string): Promise<ContentFetch> => {
      const limit: number = 5

      return new Promise(async (resolve, reject) => {
         let docRef: Query = this.db.collection("comments")
            .where("postId", "==", postId)
            .where("root", "==", true)
            .orderBy("createdAt", "desc")
            .limit(limit)

         if (lastRootCommentId) {
            const lastDoc: DocumentData = await this.db.collection("comments").doc(lastRootCommentId).get()
            docRef = docRef.startAfter(lastDoc) // add the start after if is a next page request
         }

         const snapshot: DocumentData = await docRef.get()

         const comments: DocumentData[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const user: UserInfo = await this.user.getUserDatafromUID(doc.data().owner)
            return {
               id: doc.id,
               creation: doc.createTime.seconds,
               content: doc.data().content,
               leafs_count: await this.getLeafsCommentsNumber(doc.id),
               user_data: {
                  username: user.username,
                  name: user.name,
                  pfp: user.pfp,
               },
            }
         }))

         if (comments.length > 0) {
            const lastDocId: string = snapshot.docs[snapshot.docs.length - 1].ref.id
            const content: DocumentData[] = comments
            const fetch: ContentFetch = { content, lastDocId }
            resolve(fetch)
         } else
            reject(err("server/no-content"))
      })
   }

   public fetchLeafsComments = (rootId: string, lastLeafCommentId: string): Promise<ContentFetch> => {
      const limit: number = 5

      return new Promise(async (resolve, reject) => {
         let docRef: Query = this.db.collection("comments")
            .where("root", "==", rootId)
            .orderBy("createdAt", "desc")
            .limit(limit)

         if (lastLeafCommentId) {
            const lastDoc: DocumentData = await this.db.collection("comments").doc(lastLeafCommentId).get()
            docRef = docRef.startAfter(lastDoc) // add the start after if is a next page request
         }

         const snapshot: DocumentData = await docRef.get()

         const comments: DocumentData[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
            const user: UserInfo = await this.user.getUserDatafromUID(doc.data().owner)
            return {
               id: doc.id,
               creation: doc.createTime.seconds,
               content: doc.data().content,
               user_data: {
                  username: user.username,
                  name: user.name,
                  pfp: user.pfp,
               },
            }
         }))

         if (comments.length > 0) {
            const lastDocId: string = snapshot.docs[snapshot.docs.length - 1].ref.id
            const content: DocumentData[] = comments
            const fetch: ContentFetch = { content, lastDocId }
            resolve(fetch)
         } else
            reject(err("server/no-content"))
      })
   }

   public uploadPost = (uid: string, text?: string, type?: string, content?: string): Promise<string> => {
      return new Promise((resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("posts").doc() //set the docRef to posts

            docRef.set({ //set the post information in firestore
               owner: uid,
               createdAt: Date.now() //unix format
            })

            if (text) docRef.update({ text: text })
            if (content) docRef.update({ content: content, type: type })

            resolve(docRef.id)
         } catch { reject(err("server/upload-failed")) }
      })
   }

   public uploadComment = (uid: string, rootId: string, postId: string, content: string): Promise<string> => {
      return new Promise((resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("comments").doc() //set the docRef to comments
            let root: string | boolean = ""

            if (rootId)
               root = rootId
            else
               root = true //if the post has no root, set the root to true, so the comment is not a response comment

            docRef.set({ //set the comment information in firestore
               owner: uid,
               root: root,
               content: content,
               postId: postId,
               createdAt: Date.now() //unix format
            })
            resolve(docRef.id)
         } catch { reject(err("server/upload-failed")) }
      })
   }

   public updatePost = (postId: string, text?: string, content?: string, type?: string): Promise<string> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("posts").doc(postId)

            if (text) docRef.update({ text: text })
            if (content) docRef.update({ content: content, type: type })

            resolve(docRef.id)
         } catch { reject(err("server/update-failed")) }
      })
   }

   public deletePost = (postId: string): Promise<null> => {
      return new Promise((resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("posts").doc(postId)

            docRef.delete()
            resolve(null)
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

   public deleteComment = (commentId: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("comments").doc(commentId)

            const leafsRef: Query = this.db.collection("comments").where("root", "==", commentId)
            const snapshot: QuerySnapshot = await leafsRef.get()

            const batch = this.db.batch()
            snapshot.docs.forEach((doc) => { batch.delete(doc.ref) })

            batch.delete(docRef)
            await batch.commit()

            resolve(null)
         } catch { reject(err("server/delete-failed")) }
      })
   }

   public updateLike = (postId: string, uid: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("likes").doc(uid + postId)

            if (!(await docRef.get()).exists)
               this.addLike(postId, uid).then(() => { resolve(null) })
            else
               this.removeLike(postId, uid).then(() => { resolve(null) })
         } catch { reject(err("server/update-failed")) }
      })
   }

   public addLike = (postId: string, uid: string): Promise<null> => {
      return new Promise(async (resolve) => {
         const docRef: DocumentReference = this.db.collection("likes").doc(uid + postId)

         await docRef.set({
            liker: uid,
            postId: postId
         })
         resolve(null)
      })
   }

   public removeLike = (postId: string, uid: string): Promise<null> => {
      return new Promise(async (resolve) => {
         const docRef: DocumentReference = this.db.collection("likes").doc(uid + postId)
         docRef.delete()
         resolve(null)
      })
   }

}
