import { interests } from '@assets/interests'
import { firebase, firestore } from '@config/firebase-admin.config'
import { Firestore, Query, QuerySnapshot } from 'firebase-admin/firestore'

firebase()
const db: Firestore = firestore()
//TODO: add text and image control for harmful behavior

export function isValidBday(bday: number): Promise<null> {
   return new Promise((resolve, reject) => {
      try {
         if (!bday || bday > Date.now() / 1000 || bday < -2208988800)
            reject(new Error('validation/invalid-birthdate'))

         if (((Date.now() / 1000 - 441806400) - bday) <= 0)
            reject(new Error('validation/too-young'))

         resolve(null)
      } catch { reject(new Error('validation/malformed-input')) }
   })
}

export async function isValidSignUpUsername(username: string): Promise<null> {
   return new Promise((resolve, reject) => {
      try {
         const regex: RegExp = /[^a-zA-Z0-9\_\-\.]/

         if (!username || !username.startsWith('@') || username.substring(1).match(regex)) //check if the username i approved by the regex
            reject(new Error('validation/invalid-username'))

         if (username.length > 24 + 1)
            reject(new Error('validation/username-too-long'))

         if (username.length < 6 + 1)
            reject(new Error('validation/username-too-short'))

         const usersRef: Query = db.collection('users').where('username', '==', username) //search where the username is equal to the input username

         usersRef.get().then(async (snapshot: QuerySnapshot) => {
            if (snapshot.empty) //check if username is already used
               resolve(null)
            else reject(new Error('validation/username-already-in-use'))
         })
      } catch { reject(new Error('validation/malformed-input')) }
   })
}

export async function areValidInterests(interestsList: string[]): Promise<null> {
   return new Promise((resolve, reject) => {
      try {
         if (interests.length > 5 && interests.length < 1)
            reject(new Error('validation/invalid-number-of-interests'))

         interestsList.forEach(element => {
            if (!interests.includes(element))
               reject(new Error('validation/invalid-interests'))
         })
         resolve(null)
      } catch { reject(new Error('validation/malformed-input')) }
   })
}

export async function isValidDocId(docId: string): Promise<null> {
   return new Promise(async (resolve, reject) => {
      try {
         if (docId) {
            const docRef = await db.collection('posts').doc(docId).get()

            if (docRef.exists)
               resolve(null)
            else reject(new Error('validation/invalid-doc-id'))
         } else resolve(null)
      } catch { reject(new Error('validation/invalid-doc-id')) }
   })
}

export async function isValidCommentRootId(rootId: string, postId: string): Promise<null> {
   return new Promise(async (resolve, reject) => {
      try {
         const docRef = await db.collection('comments').doc(rootId).get() //retrieve the root comment

         if (docRef.exists) {
            if (docRef.data()?.postId == postId)
               resolve(null)
            else reject(new Error('validation/invalid-doc-id'))
         } else reject(new Error('validation/invalid-doc-id'))
      } catch { reject(new Error('validation/invalid-doc-id')) }
   })
}

export async function isValidContentType(content: string, type: string): Promise<null> {
   return new Promise((resolve, reject) => {
      try {
         if (type == "text" || type == "image" || type == "audio") {
            if (type == "image" || type == "audio") {
               isValidImage(content).then(() => {
                  resolve(null)
               }).catch((error) => { reject(error) })
            } else resolve(null)
         } else reject(new Error('validation/malformed-input'))
      } catch { reject(new Error('validation/malformed-input')) }
   })
}

export async function isValidImage(image: string): Promise<null> {
   return new Promise((resolve, reject) => {
      //TODO
      resolve(null)
   })
}
