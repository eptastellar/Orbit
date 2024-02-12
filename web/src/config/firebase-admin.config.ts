import admin from 'firebase-admin'
import { ServiceAccount, cert, getApps, initializeApp } from 'firebase-admin/app'
import { Firestore } from 'firebase-admin/firestore'

export const firebase = (): void => {
   const privateKey: string = process.env.FIREBASE_PRIVATE_KEY!

   if (privateKey) {
      const firebaseAccount: ServiceAccount = {
         privateKey: privateKey.replace(/\\n/g, '\n'),
         projectId: process.env.FIREBASE_PROJECT_ID,
         clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      }

      const firebaseAdminConfig = {
         credential: cert(firebaseAccount),
         storageBucket: process.env.FIREBASE_BUCKET_ID
      }

      if (getApps().length <= 0)
         initializeApp(firebaseAdminConfig)
   }
}

export const firestore = (): Firestore => { return admin.firestore() }
export const firestorage = () => { return admin.storage().bucket() }
