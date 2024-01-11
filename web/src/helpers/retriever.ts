import admin from 'firebase-admin'
import { DocumentReference, Firestore } from 'firebase-admin/firestore'

export async function retrieveUserDataFromUID(uid: string) { //retrieve user informations based from the uid
   const db: Firestore = admin.firestore()
   const docRef: DocumentReference = db.collection('users').doc(uid)
   const doc = await docRef.get()

   const username = doc.data()?.username
   const name = doc.data()?.name
   const pfp = doc.data()?.pfp

   return { username, name, pfp } //return these fields
}

export async function retrieveUIDFromUsername(username: string): Promise<string> { //retrieve uid based from the username
   const db: Firestore = admin.firestore()
   const usersRef = db.collection('users').where("username", "==", username);

   return new Promise((resolve, reject) => {
      usersRef.get().then((snapshot) => { //retrieve documents where the username is equal to the username param
         if (!snapshot.empty) {
            snapshot.forEach((doc) => {
               const uid = doc.id;
               resolve(uid); //return the uid of the username
            });
         } else
            reject(new Error('auth/invalid-username'))
      })
   })
}
