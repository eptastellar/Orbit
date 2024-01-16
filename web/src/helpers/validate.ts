import { interests } from '@assets/interests'
import { firebase } from '@config/firebase-admin.config'
import admin from 'firebase-admin'
import { Firestore, Query, QuerySnapshot } from 'firebase-admin/firestore'

export function isValidBday(bday: number): Promise<null> {
   return new Promise((resolve, reject) => {
      if (!bday || bday > Date.now() / 1000 || bday < -2208988800)
         reject(new Error('validation/invalid-birthdate'))

      if (((Date.now() / 1000 - 441806400) - bday) <= 0)
         reject(new Error('validation/too-young'))

      resolve(null)
   })
}

export async function isValidUsername(username: string): Promise<null> {
   return new Promise((resolve, reject) => {
      firebase()
      const db: Firestore = admin.firestore()
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
   })
}

export async function areValidInterests(interestsList: string[]): Promise<null> {
   return new Promise((resolve, reject) => {
      if (interests.length > 5 && interests.length < 1)
         reject(new Error('validation/invalid-number-of-interests'))

      interestsList.forEach(element => {
         if (!interests.includes(element))
            reject(new Error('validation/invalid-interests'))
      })
      resolve(null)
   })
}

export async function isValidLastDocId(lastDocId: string): Promise<null> {
   return new Promise(async (resolve, reject) => {
      const db: Firestore = admin.firestore()

      if (lastDocId) {
         const docRef = await db.collection('posts').doc(lastDocId).get()

         if (docRef.exists)
            resolve(null)
         else reject(new Error('validation/invalid-last-doc-id'))
      } else resolve(null)
   })
}
