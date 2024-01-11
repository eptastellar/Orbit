import { baas } from '@config/firebase-admin.config';
import admin from 'firebase-admin';
import { Firestore, Query, QuerySnapshot } from 'firebase-admin/firestore';

export function isValidBday(bday: number): Promise<null> {
   return new Promise((resolve, reject) => {
      if (!bday || bday > Date.now() || bday < -2208988800)
         reject(new Error('validation/invalid-birthdate'))

      if (((Date.now() - 441806400) - bday) <= 0)
         reject(new Error('validation/too-young'))

      resolve(null)
   })
}

export async function isValidUsername(username: string): Promise<null> {
   baas()
   const db: Firestore = admin.firestore();

   return new Promise((resolve, reject) => {
      const regex = /[^a-zA-Z0-9\_\-\.]/
      if (!username || !username.startsWith('@') || username.substring(1).match(regex))
         reject(new Error('validation/invalid-username'))

      if (username.length > 24 + 1)
         reject(new Error('validation/username-too-long'))

      if (username.length < 6 + 1)
         reject(new Error('validation/username-too-short'))

      const usersRef: Query = db.collection('users').where("username", "==", username); //search where the username is equal to the input username

      usersRef.get()
         .then(async (snapshot: QuerySnapshot) => {
            if (snapshot.empty) //check if username is already used
               resolve(null)
            else
               reject(new Error('validation/username-already-in-use'));
         })
   })
}
