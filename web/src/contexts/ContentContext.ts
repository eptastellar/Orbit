import { firebase, firestorage, firestore } from '@config/firebase-admin.config'
import { retrieveUserDataFromUID } from '@contexts/UserContext'
import { PostFetch } from '@local-types/index'
import { DocumentData, DocumentReference, Query } from 'firebase-admin/firestore'

firebase()
const db = firestore()
const bucket = firestorage()

export async function randomProfilePicture(): Promise<string> {
   const prefix: string = 'default/images'

   return new Promise((resolve, _) => {
      bucket.getFiles({ prefix: prefix }, (_, files) => { // get the files from the bucket with the defined prefix
         const urls: string[] = []
         if (files) {
            files.splice(0, 1) // remove the first file from the files array

            Promise.all(
               files.map(file => // map over the files array and create a new promise for each file
                  file.getSignedUrl({
                     action: 'read',
                     expires: Date.now() + 30 * 24 * 60 * 60 * 1000 * 12 * 10, // expiration set to 10 years from now
                  })
               )
            ).then(results => {
               results.forEach(result => { // push the result of each promise (the generated URL) into the urls array
                  urls.push(result[0])
               })
               resolve(urls[Math.floor(Math.random() * urls.length)]) // resolve the promise with a random URL from the urls array
            })
         }
      })
   })
}

export async function fetchPosts(friendList: string[], lastDocId: string): Promise<PostFetch> {
   //TODO Bisogna sistemare il fatto che se ci sono meno post di quanti vuole il limite allora ritorni comunque quello che ha preso finora
   return new Promise(async (resolve, reject) => {
      const incremental: number = 3
      let posts: DocumentData[] = []

      friendList.forEach(async (friendId: string) => {
         let docRef: Query = db.collection('posts')
            .where('owner', '==', friendId)
            .orderBy('createdAt', 'desc')
            .limit(incremental - posts.length)

         if (lastDocId) {
            const lastDoc: DocumentData = await db.collection('posts').doc(lastDocId).get()
            docRef = docRef.startAfter(lastDoc)
         }

         const snapshot: DocumentData = await docRef.get()
         const { username, name, pfp } = await retrieveUserDataFromUID(friendId) //get all the user data

         posts.push(snapshot.docs.map((doc: DocumentData) => ({ //map all the posts
            id: doc.id,
            creation: doc.createTime.seconds,
            type: doc.data().type,
            content: doc.data().content,
            likes_number: doc.data().likes_number,

            user_data: {
               username: username,
               name: name,
               pfp: pfp,
            },
         })))

         if (posts.length == 0) {
            reject(new Error('resource/no-content'))
         } else if (posts.length == incremental - 1) {
            const lastDocId: string = snapshot.docs[snapshot.docs.length - 1].ref.id
            const fetch: PostFetch = { posts, lastDocId }
            resolve(fetch)
         }
      })
   })
}

export async function uploadPost(uid: string, type: string, content: string): Promise<string> {
   return new Promise((resolve, reject) => {
      try {
         const docRef: DocumentReference = db.collection('posts').doc() //set the docRef to posts

         docRef.set({ //set the post information in firestore
            owner: uid,
            type: type,
            content: content,
            likes_number: 0,
            createdAt: Date.now() //unix format
         })
         resolve(docRef.id)
      } catch (error) { reject(new Error('server/upload-failed')) }
   })
}
