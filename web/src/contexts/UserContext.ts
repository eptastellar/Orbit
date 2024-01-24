import { firebase } from '@config/firebase-admin.config'
import neo4j from '@config/neo4j.config'
import { firestore } from 'firebase-admin'
import { DocumentData, DocumentReference, Firestore, Query, QuerySnapshot } from 'firebase-admin/firestore'

firebase()
const db: Firestore = firestore()

export async function retrieveUserDataFromUID(uid: string) { //retrieve user informations based from the uid
   const docRef: DocumentReference = db.collection('users').doc(uid)
   const doc: DocumentData = await docRef.get()

   const username: string = doc.data()?.username
   const name: string = doc.data()?.name
   const pfp: string = doc.data()?.pfp

   return { username, name, pfp } //return these fields
}

export async function retrieveUIDFromUsername(username: string): Promise<string> { //retrieve uid based from the username
   const usersRef: Query = db.collection('users').where('username', '==', username)

   return new Promise((resolve, reject) => {
      usersRef.get().then((snapshot: QuerySnapshot) => { //retrieve documents where the username is equal to the username param
         if (!snapshot.empty) {
            snapshot.forEach((doc) => {
               const uid = doc.id
               resolve(uid) //return the uid of the username
            })
         } else reject(new Error('server/user-not-found'))
      })
   })
}

export async function getFriendCount(uid: string): Promise<number> {
   return new Promise<number>(async (resolve, reject) => {
      const query: string = `MATCH (u:User)-[:Friend]-(t:User) where u.name = '${uid}' RETURN t`
      if (neo4j) {
         const resultQueryFriends = await neo4j.executeWrite(tx => tx.run(query))
         let friends = resultQueryFriends.records.map(row => row.get('t'))
         resolve(friends.length)
      }
      reject(new Error('server/driver-not-found'))
   })
}

export async function getPostCount(uid: string): Promise<number> { //get the snapshot size of all the posts where uid is equal to the owner
   const postsRef: Query = db.collection('posts').where('owner', '==', uid)
   const snapshot: QuerySnapshot = await postsRef.get()
   return snapshot.size
}

export async function getMeteorCount(uid: string): Promise<number> {
   //TODO
   return 0
}
