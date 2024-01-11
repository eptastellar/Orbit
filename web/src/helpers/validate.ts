import admin from 'firebase-admin';
import { Firestore, Query, QuerySnapshot } from 'firebase-admin/firestore';

export function isValidBday(bday: number): Promise<null> {
   return new Promise((resolve, reject) => {
      if (bday > Date.now() || bday < -2208988800)
         reject(new Error('validation/invalid-birthdate'))

      if (((Date.now() - 441806400) - bday) >= 0)
         reject(new Error('validation/too-young'))

      resolve(null)
   })
}

export async function isValidUsername(username: string): Promise<null> {
   const db: Firestore = admin.firestore();
   const usersRef: Query = db.collection('users').where("username", "==", username); //search where the username is equal to the input username

   return new Promise((resolve, reject) => {
      if (username.length > 24)
         reject(new Error('validation/username-too-long'))

      const regex = '[^a-zA-Z0-9_\-.]'
      if (username.match(regex) || !username.startsWith('@'))
         reject(new Error('validation/invalid-username'))

      usersRef.get()
         .then(async (snapshot: QuerySnapshot) => {
            if (snapshot.empty) //check if username is already used
               resolve(null)
            else
               reject(new Error('validation/username-already-in-use'));
         })
   })
}
