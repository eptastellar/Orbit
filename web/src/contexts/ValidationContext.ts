import { interests } from '@assets/interests'
import { err } from '@config/error'
import { firebase, firestorage, firestore } from '@config/firebase-admin.config'
import { DocumentData, Firestore, Query, QuerySnapshot } from 'firebase-admin/firestore'

firebase()
const db: Firestore = firestore()
const bucket = firestorage()

export const birthdateValidation = async (bday: number): Promise<null> => {
   return new Promise((resolve, reject) => {
      try {
         if (!bday || bday > Date.now() / 1000 || bday < -2208988800)
            reject(err('validation/invalid-birthdate'))

         if (((Date.now() / 1000 - 441806400) - bday) <= 0)
            reject(err('validation/too-young'))

         resolve(null)
      } catch { reject(err('validation/malformed-input')) }
   })
}

export const usernameValidation = async (username: string): Promise<null> => {
   return new Promise((resolve, reject) => {
      try {
         const regex: RegExp = /[^a-zA-Z0-9\_\-\.]/

         if (!username || !username.startsWith('@') || username.substring(1).match(regex)) //check if the username i approved by the regex
            reject(err('validation/invalid-username'))

         if (username.length > 24 + 1)
            reject(err('validation/username-too-long'))

         if (username.length < 6 + 1)
            reject(err('validation/username-too-short'))

         const usersRef: Query = db.collection('users').where('username', '==', username) //search where the username is equal to the input username

         usersRef.get().then(async (snapshot: QuerySnapshot) => {
            if (snapshot.empty) //check if username is already used
               resolve(null)
            else reject(err('validation/username-already-in-use'))
         })
      } catch { reject(err('validation/malformed-input')) }
   })
}

export const interestsValidation = async (interestsList: string[]): Promise<null> => {
   return new Promise((resolve, reject) => {
      try {
         if (interestsList.length > 5 || interestsList.length < 1)
            reject(err('validation/invalid-number-of-interests'))

         interestsList.forEach(element => {
            if (!interests.includes(element))
               reject(err('validation/invalid-interests'))
         })
         resolve(null)
      } catch { reject(err('validation/malformed-input')) }
   })
}

export const postIdValidation = (postId: string): Promise<null> => {
   return new Promise(async (resolve, reject) => {
      try {
         const docRef: DocumentData = await db.collection('posts').doc(postId).get()

         if (docRef.exists)
            resolve(null)
         else reject(err('validation/invalid-document-id'))
      } catch { reject(err('validation/invalid-document-id')) }
   })
}

export const commentRootIdValidation = async (rootId: string, postId: string): Promise<null> => {
   return new Promise(async (resolve, reject) => {
      try {
         const docRef: DocumentData = await db.collection('comments').doc(rootId).get() //retrieve the root comment

         if (docRef.exists) {
            if (docRef.data()?.postId === postId)
               resolve(null)
            else reject(err('validation/invalid-document-id'))
         } else reject(err('validation/invalid-document-id'))
      } catch { reject(err('validation/invalid-document-id')) }
   })
}

export const commentLeafIdValidation = async (leafId: string, rootId: string, postId: string): Promise<null> => {
   return new Promise(async (resolve, reject) => {
      try {
         const leafRef: DocumentData = await db.collection('comments').doc(leafId).get() //retrieve the leaf comment
         const rootRef: DocumentData = await db.collection('comments').doc(rootId).get() //retrieve the root comment

         if (rootRef.exists) {
            if (rootRef.data()?.postId === postId) {
               if (leafRef.data()?.postId === postId) {
                  if (leafRef.data()?.root === rootId)
                     resolve(null)
                  else reject(err('validation/invalid-document-id'))
               } else reject(err('validation/invalid-document-id'))
            } else reject(err('validation/invalid-document-id'))
         } else reject(err('validation/invalid-document-id'))
      } catch { reject(err('validation/invalid-document-id')) }
   })
}

export const contentValidation = async (text?: string, content?: string, type?: string): Promise<null> => {
   return new Promise(async (resolve, reject) => {
      try {
         if (content) {
            if (text) await harmfulContentValidation(text)

            if (type === "image" || type === "audio")
               await mediaValidation(content)
            else reject(err('validation/malformed-input'))
         } else {
            if (text)
               await harmfulContentValidation(text)
            else reject(err('validation/malformed-input'))
         }
         resolve(null)
      } catch (error) { reject(error) }
   })
}


export const mediaValidation = (media: string): Promise<null> => {
   return new Promise(async (resolve, reject) => {
      const cleanURL: string = media.split('appspot.com/o/')[1]
      const removeToken: string = cleanURL.split('?')[0]

      const formattedPath: string = removeToken.replace(/%2F/g, '/')
      const fileRef = bucket.file(decodeURIComponent(formattedPath));

      fileRef.exists().then((exists) => {
         if (exists[0])
            resolve(null)
         else reject(err('validation/invalid-image-path'))
      })
   })
}

export const harmfulContentValidation = (text: string): Promise<null> => {
   return new Promise((resolve, reject) => {
      //TODO enhance
      resolve(null)
   })
}
