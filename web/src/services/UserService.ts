import { err, firebase, neo } from "config"
import { firestore } from "firebase-admin"
import { DocumentData, DocumentReference, Firestore, Query, QuerySnapshot } from "firebase-admin/firestore"
import { QueryResult, Session } from "neo4j-driver"
import { UserSchema } from "types"

export default class UserService {
   private db: Firestore

   constructor() {
      firebase()
      this.db = firestore()
   }

   public getUserDatafromUID = async (uid: string): Promise<UserSchema> => { //retrieve user informations based from the uid
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("users").doc(uid)
            const doc: DocumentData = await docRef.get()

            const username: string = doc.data()?.username
            const name: string = doc.data()?.name
            const pfp: string = doc.data()?.pfp

            const userSchema: UserSchema = { username, name, pfp }
            resolve(userSchema)
         } catch { reject(err("server/user-not-found")) }
      })
   }

   public getUIDfromUserData = async (username: string): Promise<string> => { //retrieve uid based from the username
      return new Promise((resolve, reject) => {
         const usersRef: Query = this.db.collection("users").where("username", "==", username)
         usersRef.get().then((snapshot: QuerySnapshot) => { //retrieve documents where the username is equal to the username param
            if (!snapshot.empty) {
               snapshot.forEach((doc) => {
                  const uid = doc.id
                  resolve(uid) //return the uid of the username
               })
            } else reject(err("server/user-not-found"))
         })
      })
   }

   public getFriendsCount = (uid: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const neo4j: Session = neo()
         const query: string = `MATCH (u:User)-[:Friend]-(t:User) where u.name = '${uid}' RETURN t`
         const resultQueryFriends = await neo4j.executeWrite(tx => tx.run(query))
         const friends = resultQueryFriends.records.map(row => row.get("t"))

         resolve(friends.length)
      })
   }

   public getPostCount = (uid: string): Promise<number> => { //get the snapshot size of all the posts where uid is equal to the owner
      return new Promise(async (resolve) => {
         const postsRef: Query = this.db.collection("posts").where("owner", "==", uid)
         const snapshot: QuerySnapshot = await postsRef.get()
         resolve(snapshot.size)
      })
   }

   public getMeteorCount = (uid: string): Promise<number> => {
      return new Promise((resolve, reject) => {
         //TODO  @TheInfernalNick
         resolve(0)
      })
   }

   public getFriendList = (uid: string): Promise<string[]> => {
      return new Promise(async (resolve, reject) => {
         const neo4j: Session = neo()
         const tempArray: string[] = []
         const queryFriends: string = `MATCH (n:User)-[:Friend]-(p:User) where n.name = '${uid}' RETURN p`
         const resultMap: QueryResult = await neo4j.executeRead(tx => tx.run(queryFriends))
         const uids = resultMap.records.map(row => row.get("p"))
         uids.forEach(element => {
            tempArray.push(element.properties["name"])
         })

         if (tempArray.length > 0)
            resolve(tempArray)
         else reject(err("server/no-friends"))
      })
   }

   public areFriends = (personalUid: string, friendUid: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         if (personalUid != friendUid) {
            const neo4j: Session = neo()
            const query: string = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) where u.name = "${personalUid}" AND t.name = "${friendUid}" RETURN t`
            const resultMap: QueryResult = await neo4j.executeRead(tx => tx.run(query))
            const check = resultMap.records.map(row => row.get("t"))

            if (check[0] !== null)
               resolve(null)
            else reject(err("server/not-friends"))
         } else resolve(null)
      })
   }

   public getInterestsFromUID = (uid: string): Promise<string[]> => {
      return new Promise(async (resolve) => {
         const neo4j: Session = neo()
         const query: string = `MATCH (u:User) where u.name = '${uid}' RETURN u.interests` //retrieves the interests from neo4j for a specific user
         const result: QueryResult = await neo4j.executeRead(tx => tx.run(query))
         const results: string[] = result.records.map(row => row.get("u.interests"))
         const out = results[0].split(",")
         resolve(out)
      })
   }

   public patchUserInfo = (uid: string, interests: string[], userSchema: UserSchema): Promise<null> => {
      return new Promise(async (resolve) => {
         const neo4j: Session = neo()
         const usersRef: DocumentReference = this.db.collection("users").doc(uid)
         usersRef.set({ ...userSchema })

         const query: string = `MATCH (u:User) where u.name = '${uid}' SET u.interests = '${interests}'` //sets everything that can be changed
         await neo4j.executeWrite(tx => tx.run(query))
         resolve(null)
      })
   }

   public hasPermission = (uid: string, id: string, path: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection(path).doc(id)

            if ((await docRef.get()).data()?.owner == uid)
               resolve(null)
            else reject(err("server/unauthorized"))
         } catch { reject(err("server/unauthorized")) }
      })
   }

   public deleteUser = (uid: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try { //deletes the user reference and sessionReference in firebase and deletes the note in neo4j
            //firebase
            const userRef: DocumentReference = this.db.collection("users").doc(uid)
            const sessionRef: DocumentReference = this.db.collection("sessions").doc(uid)

            userRef.delete()
            sessionRef.delete()

            //neo4j
            const neo4j: Session = neo()
            const query: string = `MATCH (u:User) where u.name = '${uid}' DETACH DELETE u`
            const result: QueryResult = await neo4j.executeWrite(tx => tx.run(query))

            resolve(null)
         } catch { reject(err("server/unauthorized")) }
      })

   }

   public removeBatch = (type: string, uid: string): Promise<null> => {
      return new Promise(async (resolve) => {
         const postsRef: Query = this.db.collection(`${type}`).where("owner", "==", uid)
         const snapshot: QuerySnapshot = await postsRef.get()

         const batch = this.db.batch()
         snapshot.docs.forEach((doc) => { batch.delete(doc.ref) }) //removes all the posts of the user in one batch to dont overload firebase

         await batch.commit()

         if (snapshot.size === 0)
            resolve(null)

         process.nextTick(() => { this.removeBatch(type, uid) })
      })
   }

   public setRandomFriendCode = (uid: string, friendCode: string): Promise<null> => {
      return new Promise(async (resolve) => {
         const friendCodeTimer: number = Date.now() + 60000
         const neo4j: Session = neo()
         const query: string = `MATCH (u:User) where u.name = '${uid}' SET u.friendCode = '${friendCode}', u.friendCodeTime = '${friendCodeTimer}'` //sets the random number to myself in neo
         await neo4j.executeWrite(tx => tx.run(query))

         resolve(null)
      })
   }

   public findRandomFriendCode = (uid: string, friendCode: string): Promise<string | null> => {
      return new Promise(async (resolve) => {
         const friendCodeRequest: number = Date.now()
         const neo4j: Session = neo()
         const queryXFriend: string = `MATCH (u:User{friendCode : '${friendCode}'}), (t:User{name : "${uid}"}) WHERE u.friendCodeTime >=  "${friendCodeRequest}" MERGE (u)-[:Friend]-(t)` //sets the friend connection
         await neo4j.executeWrite(tx => tx.run(queryXFriend))

         const queryXUser: string = `MATCH (u:User{friendCode : '${friendCode}'}) RETURN u.name` // Searches for the name of the friend which i scanned the code
         const nameResult: QueryResult = await neo4j.executeRead(tx => tx.run(queryXUser))
         const name: string[] = nameResult.records.map(row => row.get("u.name"))

         const queryXConfirm: string = `OPTIONAL MATCH p = (u:User {name : "${uid}"}) - [:Friend] - (t:User {name:"${name}"}) RETURN p` //Checks if it created the connection, if it doesnt returns null
         const confirmResult: QueryResult = await neo4j.executeRead(tx => tx.run(queryXConfirm))
         const confirm: string[] = confirmResult.records.map(row => row.get("p"))
         if (confirm[0] === null) resolve(null)
         else resolve(name[0])
      })
   }

   public randomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min

   public createRandomString = (length: number): string => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      let result = ""
      const randomArray = new Uint8Array(length)

      randomArray.forEach((number) => {
         result += chars[this.randomInt(0, chars.length)]
      })
      return result
   }

}
