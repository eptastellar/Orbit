import { err } from "@config/error"
import { firebase, firestorage, firestore } from "@config/firebase-admin.config"
import { getUserDatafromUID } from "@contexts/UserContext"
import { ContentFetch, UserInfo } from "@local-types/index"
import { DocumentData, DocumentReference, Firestore, Query, QuerySnapshot } from "firebase-admin/firestore"

firebase()
const db: Firestore = firestore()
const bucket = firestorage()

export const randomPicture = (prefix: string): Promise<string> => {
   return new Promise((resolve, reject) => {
      try {
         bucket.getFiles({ prefix: prefix }, (_, files) => { // get the files from the bucket with the defined prefix
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

export const fetchPosts = (uids: string[], lastPostId: string, personalUID: string): Promise<ContentFetch> => {
   const limit: number = 5

   return new Promise(async (resolve, reject) => {
      let docRef: Query = db.collection("posts")
         .where("owner", "in", uids)
         .orderBy("createdAt", "desc")
         .limit(limit)

      if (lastPostId) {
         const lastDoc: DocumentData = await db.collection("posts").doc(lastPostId).get()
         docRef = docRef.startAfter(lastDoc) // add the start after if is a next page request
      }

      const snapshot: DocumentData = await docRef.get()

      const posts: DocumentData[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
         const user: UserInfo = await getUserDatafromUID(doc.data().owner)
         const isLiked: boolean = await isLikedBy(doc.id, personalUID)

         return {
            id: doc.id,
            creation: doc.createTime.seconds,
            text: doc.data().text,
            type: doc.data().type,
            content: doc.data().content,
            likes_number: await getLikesNumber(doc.id),
            comments_number: await getRootsCommentsNumber(doc.id),
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

export const isLikedBy = (postId: string, uid: string): Promise<boolean> => {
   return new Promise(async (resolve) => {
      const snapshot: QuerySnapshot = await db.collection("likes")
         .where("liker", "==", uid)
         .where("postId", "==", postId)
         .get()

      resolve(!snapshot.empty)
   })
}

export const getLikesNumber = (postId: string): Promise<number> => {
   return new Promise(async (resolve) => {
      const queryRef: Query = db.collection("likes")
         .where("postId", "==", postId)

      const snapshot = await queryRef.count().get()
      resolve(snapshot.data().count)
   })
}

export const getRootsCommentsNumber = (postId: string): Promise<number> => {
   return new Promise(async (resolve) => {
      const queryRef: Query = db.collection("comments")
         .where("postId", "==", postId)

      const snapshot = await queryRef.count().get()
      resolve(snapshot.data().count)
   })
}

export const getLeafsCommentsNumber = (rootId: string): Promise<number> => {
   return new Promise(async (resolve) => {
      const queryRef: Query = db.collection("comments")
         .where("root", "==", rootId)

      const snapshot = await queryRef.count().get()
      resolve(snapshot.data().count)
   })
}

export const fetchRootComments = (postId: string, lastRootCommentId: string): Promise<ContentFetch> => {
   const limit: number = 5

   return new Promise(async (resolve, reject) => {
      let docRef: Query = db.collection("comments")
         .where("postId", "==", postId)
         .where("root", "==", true)
         .orderBy("createdAt", "desc")
         .limit(limit)

      if (lastRootCommentId) {
         const lastDoc: DocumentData = await db.collection("comments").doc(lastRootCommentId).get()
         docRef = docRef.startAfter(lastDoc) // add the start after if is a next page request
      }

      const snapshot: DocumentData = await docRef.get()

      const comments: DocumentData[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
         const user: UserInfo = await getUserDatafromUID(doc.data().owner)
         return {
            id: doc.id,
            creation: doc.createTime.seconds,
            content: doc.data().content,
            leafs_count: await getLeafsCommentsNumber(doc.id),
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

export const fetchLeafsComments = (rootId: string, lastLeafCommentId: string): Promise<ContentFetch> => {
   const limit: number = 5

   return new Promise(async (resolve, reject) => {
      let docRef: Query = db.collection("comments")
         .where("root", "==", rootId)
         .orderBy("createdAt", "desc")
         .limit(limit)

      if (lastLeafCommentId) {
         const lastDoc: DocumentData = await db.collection("comments").doc(lastLeafCommentId).get()
         docRef = docRef.startAfter(lastDoc) // add the start after if is a next page request
      }

      const snapshot: DocumentData = await docRef.get()

      const comments: DocumentData[] = await Promise.all(snapshot.docs.map(async (doc: DocumentData) => {
         const user: UserInfo = await getUserDatafromUID(doc.data().owner)
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

export const uploadPost = (uid: string, text?: string, type?: string, content?: string): Promise<string> => {
   return new Promise((resolve, reject) => {
      try {
         const docRef: DocumentReference = db.collection("posts").doc() //set the docRef to posts

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

export const uploadComment = (uid: string, rootId: string, postId: string, content: string): Promise<string> => {
   return new Promise((resolve, reject) => {
      try {
         const docRef: DocumentReference = db.collection("comments").doc() //set the docRef to comments
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

export const updatePost = (postId: string, text?: string, content?: string, type?: string): Promise<string> => {
   return new Promise(async (resolve, reject) => {
      try {
         const docRef: DocumentReference = db.collection("posts").doc(postId)

         if (text) docRef.update({ text: text })
         if (content) docRef.update({ content: content, type: type })

         resolve(docRef.id)
      } catch { reject(err("server/update-failed")) }
   })
}

export const deletePost = (postId: string): Promise<null> => {
   return new Promise((resolve, reject) => {
      try {
         const docRef: DocumentReference = db.collection("posts").doc(postId)

         docRef.delete()
         resolve(null)
      } catch { reject(err("server/delete-failed")) }
   })
}

export const getPostOwner = (postId: string): Promise<string> => {
   return new Promise(async (resolve) => {
      const docRef: DocumentReference = db.collection("posts").doc(postId)

      const doc: DocumentData = await docRef.get()

      resolve(doc.data().owner)
   })
}

export const deleteComment = (commentId: string): Promise<null> => {
   return new Promise(async (resolve, reject) => {
      try {
         const docRef: DocumentReference = db.collection("comments").doc(commentId)

         const leafsRef: Query = db.collection("comments").where("root", "==", commentId)
         const snapshot: QuerySnapshot = await leafsRef.get()

         const batch = db.batch()
         snapshot.docs.forEach((doc) => { batch.delete(doc.ref) })

         batch.delete(docRef)
         await batch.commit()

         resolve(null)
      } catch { reject(err("server/delete-failed")) }
   })
}

export const updateLike = (postId: string, uid: string): Promise<null> => {
   return new Promise(async (resolve, reject) => {
      try {
         const docRef: DocumentReference = db.collection("likes").doc(uid + postId)

         if (!(await docRef.get()).exists)
            addLike(postId, uid).then(() => { resolve(null) })
         else
            removeLike(postId, uid).then(() => { resolve(null) })
      } catch { reject(err("server/update-failed")) }
   })
}

export const addLike = (postId: string, uid: string): Promise<null> => {
   return new Promise(async (resolve) => {
      const docRef: DocumentReference = db.collection("likes").doc(uid + postId)

      await docRef.set({
         liker: uid,
         postId: postId
      })
      resolve(null)
   })
}

export const removeLike = (postId: string, uid: string): Promise<null> => {
   return new Promise(async (resolve) => {
      const docRef: DocumentReference = db.collection("likes").doc(uid + postId)
      docRef.delete()
      resolve(null)
   })
}
