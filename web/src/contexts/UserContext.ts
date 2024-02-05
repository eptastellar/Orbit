import { firebase } from '@config/firebase-admin.config'
import { neo } from '@config/neo4j.config'
import { UserInfo } from '@local-types/index'
import { firestore } from 'firebase-admin'
import { DocumentData, DocumentReference, Firestore, Query, QuerySnapshot } from 'firebase-admin/firestore'
import { QueryResult, Session } from 'neo4j-driver'
import { getLikesNumber } from './ContentContext'

firebase()
const neo4j: Session = neo()
const db: Firestore = firestore()

export const getUserDatafromUID = async (uid: string): Promise<UserInfo> => { //retrieve user informations based from the uid
   return new Promise(async (resolve, reject) => {
      try {
         const docRef: DocumentReference = db.collection('users').doc(uid)
         const doc: DocumentData = await docRef.get()

         const username: string = doc.data()?.username
         const name: string = doc.data()?.name
         const pfp: string = doc.data()?.pfp

         const user: UserInfo = { username, name, pfp }
         resolve(user)
      } catch (error) { reject(new Error('')) }
   })

}

export const getUIDfromUserData = async (username: string): Promise<string> => { //retrieve uid based from the username
   return new Promise((resolve, reject) => {
      const usersRef: Query = db.collection('users').where('username', '==', username)
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

export const getFriendsCount = (uid: string): Promise<number> => {
   return new Promise(async (resolve, _) => {
      const query: string = `MATCH (u:User)-[:Friend]-(t:User) where u.name = '${uid}' RETURN t`
      const resultQueryFriends = await neo4j.executeWrite(tx => tx.run(query))
      let friends = resultQueryFriends.records.map(row => row.get('t'))
      resolve(friends.length)
   })
}

export const getPostCount = (uid: string): Promise<number> => { //get the snapshot size of all the posts where uid is equal to the owner
   return new Promise(async (resolve, _) => {
      const postsRef: Query = db.collection('posts').where('owner', '==', uid)
      const snapshot: QuerySnapshot = await postsRef.get()
      resolve(snapshot.size)
   })
}

export const getMeteorCount = (uid: string): Promise<number> => {
   return new Promise((resolve, reject) => {
      //TODO  @TheInfernalNick
      resolve(0)
   })
}

export const getFriendList = (uid: string): Promise<string[]> => {
   return new Promise(async (resolve, _) => {
      const tempArray: string[] = []
      const queryFriends = `MATCH (n:User)-[:Friend]-(p:User) where n.name = '${uid}' RETURN p`
      const resultMap = await neo4j.executeRead(tx => tx.run(queryFriends))
      const uids = resultMap.records.map(row => row.get('p'))
      uids.forEach(element => {
         tempArray.push(element.properties['name'])
      })
      resolve(tempArray)
   })
}

export const areFriends = (personalUid: string, friendUid: string): Promise<null> => {
   return new Promise(async (resolve, reject) => {
      if (personalUid != friendUid) {
         const query: string = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) where u.name = "${personalUid}" AND t.name = "${friendUid}" RETURN t`
         const resultMap: QueryResult = await neo4j.executeRead(tx => tx.run(query))
         let check = resultMap.records.map(row => row.get('t'))

         if (check[0] !== null)
            resolve(null)
         else reject(new Error("resources/not-friends"))
      } else resolve(null)
   })
}

//retrieves the interests from neo4j for a specific user
export const getInterestsFromUID = (uid: string): Promise<string[]> => {
   return new Promise(async (resolve, _) => {
      const query: string = `MATCH (u:User) where u.name = '${uid}' RETURN u.interests`
      const result: QueryResult = await neo4j.executeRead(tx => tx.run(query))
      let results: string[] = result.records.map(row => row.get('u.interests'))
      let out = results[0].split(",")
      resolve(out)
   })
}

//Sets everything that can be changed
export const patchUserInfo = (uid: string, interests: string[], user: UserInfo): Promise<null> => {
   return new Promise(async (resolve, _) => {
      const usersRef: DocumentReference = db.collection('users').doc(uid)
      usersRef.set({ username: user.username, name: user.name, pfp: user.pfp })

      const query: string = `MATCH (u:User) where u.name = '${uid}' SET u.interests = '${interests}'`
      await neo4j.executeWrite(tx => tx.run(query))
      resolve(null)
   })
}

export const hasPermission = (uid: string, postId: string): Promise<null> => {
   return new Promise(async (resolve, reject) => {
      try {
         const docRef: DocumentReference = db.collection('posts').doc(postId)

         if ((await docRef.get()).data()?.owner == uid)
            resolve(null)
         else reject('server/unauthorized')
      } catch (error) { reject('server/unauthorized') }
   })
}

//deletes the userReference and sessionReference in firebase and deletes the note in neo4j
export const deleteUser = (uid: string): Promise<null> => {
   return new Promise(async (resolve, reject) => {
      try {
         //firebase
         const userRef: DocumentReference = db.collection('users').doc(uid)
         const sessionRef: DocumentReference = db.collection('sessions').doc(uid)
         removeBatch("posts", uid).then(() => removeBatch("comments", uid).then(() => userRef.delete().then(() => sessionRef.delete())))


         //neo4j
         const query: string = `MATCH (u:User) where u.name = '${uid}' DETACH DELETE u`
         const result: QueryResult = await neo4j.executeWrite(tx => tx.run(query))

         resolve(null)
      } catch (error) { reject('server/unauthorized') }
   })

}

//removes all the posts of the user in one batch to dont overload firebase
async function removeBatch(type: string, uid: string): Promise<null> {
   return new Promise(async (resolve, reject) => {
      const postsRef: Query = db.collection(`${type}`).where('owner', '==', uid)
      const snapshot: QuerySnapshot = await postsRef.get()

      const batch = db.batch()
      snapshot.docs.forEach((doc) => {
         batch.delete(doc.ref)
      })
      await batch.commit()
      if (snapshot.size === 0) {
         resolve(null)
      }
      process.nextTick(() => {
         removeBatch(type, uid)
      })
   })
}

export const updateLike = (postId: string, uid: string): Promise<number> => {
   return new Promise(async (resolve, _) => {
      const docRef: DocumentReference = db.collection('likes').doc(uid + postId)

      if (!(await docRef.get()).exists)
         addLike(postId, uid).then(async () => { resolve(await getLikesNumber(postId)) })
      else
         removeLike(postId, uid).then(async () => { resolve(await getLikesNumber(postId)) });
   })
}

export const addLike = (postId: string, uid: string): Promise<null> => {
   return new Promise(async (resolve, _) => {
      const docRef: DocumentReference = db.collection('likes').doc(uid + postId)

      await docRef.set({
         liker: uid,
         postId: postId
      })
      resolve(null)
   })
}

export const removeLike = (postId: string, uid: string): Promise<null> => {
   return new Promise(async (resolve, _) => {
      const docRef: DocumentReference = db.collection('likes').doc(uid + postId)
      docRef.delete()
      resolve(null)
   })
}
