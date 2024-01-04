import admin from 'firebase-admin'

export async function retriveUserData(uid: string) { //retrive user informations based from the uid
   const db = admin.firestore()
   const docRef = db.collection('users').doc(uid)
   const doc = await docRef.get()

   const username = doc.data()?.username
   const name = doc.data()?.name
   const pfp = doc.data()?.pfp

   return { username, name, pfp } //return these fields
}
