import { supernova } from "algorithms"
import { err, firebase, neo } from "config"
import { firestore } from "firebase-admin"
import { DocumentData, DocumentReference, Firestore, Query, QuerySnapshot } from "firebase-admin/firestore"
import { QueryResult } from "neo4j-driver"
import { IdResponse, SupernovaResponse, UserSchema } from "types"

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
            const data: DocumentData[string] = doc.data()

            const username: string = data?.username
            const name: string = data?.name
            const pfp: string = data?.pfp
            const bday: number = data?.bday

            const userSchema: UserSchema = {
               username,
               name,
               pfp,
               bday
            }
            resolve(userSchema)
         } catch { reject(err("server/user-not-found")) }
      })
   }

   public getUIDfromUserData = async (username: string): Promise<string> => { //retrieve uid based from the username
      return new Promise((resolve, reject) => {
         const usersRef: Query = this.db.collection("users")
            .where("username", "==", username)

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
         const query: string = `MATCH (u:User)-[:Friend]-(t:User) where u.name = '${uid}' RETURN t`
         const resultQueryFriends = await neo().executeWrite(tx => tx.run(query))
         const friends = resultQueryFriends.records.map(row => row.get("t"))

         resolve(friends.length)
      })
   }

   public getPostCount = (uid: string): Promise<number> => { //get the snapshot size of all the posts where uid is equal to the owner
      return new Promise(async (resolve) => {
         const postsRef: Query = this.db.collection("posts")
            .where("owner", "==", uid)

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
         const tempArray: string[] = []
         const queryFriends: string = `MATCH (n:User)-[:Friend]-(p:User) where n.name = '${uid}' RETURN p`
         const resultMap: QueryResult = await neo().executeRead(tx => tx.run(queryFriends))
         const uids = resultMap.records.map((row: any) => row.get("p"))
         uids.forEach((element: any) => {
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
            const query: string = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) where u.name = "${personalUid}" AND t.name = "${friendUid}" RETURN t`
            const resultMap: QueryResult = await neo().executeRead(tx => tx.run(query))
            const check = resultMap.records.map((row: any) => row.get("t"))

            if (check[0] !== null)
               resolve(null)
            else reject(err("server/not-friends"))
         } else resolve(null)
      })
   }

   public getInterestsFromUID = (uid: string): Promise<string[]> => {
      return new Promise(async (resolve) => {
         const query: string = `MATCH (u:User) where u.name = '${uid}' RETURN u.interests` //retrieves the interests from neo4j for a specific user
         const result: QueryResult = await neo().executeRead(tx => tx.run(query))
         const results: string[] = result.records.map((row: any) => row.get("u.interests"))
         const out = results[0].split(",")
         resolve(out)
      })
   }

   public patchUserInfo = (uid: string, userSchema: UserSchema): Promise<IdResponse> => {
      return new Promise(async (resolve) => {
         const docRef: DocumentReference = this.db.collection("users").doc(uid)
         docRef.set({ ...userSchema })

         const query: string = `MATCH (u:User) where u.name = '${uid}' SET u.interests = '${userSchema.interests}'` //sets everything that can be changed
         await neo().executeWrite(tx => tx.run(query))

         const id: string = docRef.id
         const idResponse: IdResponse = {
            id
         }
         resolve(idResponse)
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

   public deleteUser = (uid: string): Promise<string> => {
      return new Promise(async (resolve, reject) => {
         try { //deletes the user reference and sessionReference in firebase and deletes the note in neo4j
            //firebase
            const userRef: DocumentReference = this.db.collection("users").doc(uid)
            const sessionRef: DocumentReference = this.db.collection("sessions").doc(uid)

            userRef.delete()
            sessionRef.delete()

            //neo4j
            const query: string = `MATCH (u:User) where u.name = '${uid}' DETACH DELETE u`
            const result: QueryResult = await neo().executeWrite(tx => tx.run(query))

            resolve(uid)
         } catch { reject(err("server/unauthorized")) }
      })

   }

   public removeBatch = (type: string, uid: string): Promise<null> => {
      return new Promise(async (resolve) => {
         const postsRef: Query = this.db.collection(`${type}`)
            .where("owner", "==", uid)

         const snapshot: QuerySnapshot = await postsRef.get()

         const batch = this.db.batch()
         snapshot.docs.forEach((doc) => { batch.delete(doc.ref) }) //removes all the posts of the user in one batch to dont overload firebase

         await batch.commit()

         if (snapshot.size === 0)
            resolve(null)

         process.nextTick(() => { this.removeBatch(type, uid) })
      })
   }

   public setRandomFriendCode = (uid: string, friendCode: string): Promise<number> => {
      return new Promise(async (resolve) => {
         const friendCodeTimer: number = Date.now() + 60000
         const query: string = `MATCH (u:User) where u.name = '${uid}' SET u.friendCode = '${friendCode}', u.friendCodeTime = '${friendCodeTimer}'` //sets the random number to myself in neo
         await neo().executeWrite(tx => tx.run(query))

         resolve(friendCodeTimer)
      })
   }

   public findRandomFriendCode = (uid: string, friendCode: string): Promise<string | null> => {
      return new Promise(async (resolve) => {
         const friendCodeRequest: number = Date.now()
         const queryXFriend: string = `MATCH (u:User{friendCode : '${friendCode}'}), (t:User{name : "${uid}"}) WHERE u.friendCodeTime >=  "${friendCodeRequest}" MERGE (u)-[:Friend]-(t)` //sets the friend connection
         await neo().executeWrite(tx => tx.run(queryXFriend))

         const queryXUser: string = `MATCH (u:User{friendCode : '${friendCode}'}) RETURN u.name` // Searches for the name of the friend which i scanned the code
         const nameResult: QueryResult = await neo().executeRead(tx => tx.run(queryXUser))
         const name: string[] = nameResult.records.map((row: any) => row.get("u.name"))

         const queryXConfirm: string = `OPTIONAL MATCH p = (u:User {name : "${uid}"}) - [:Friend] - (t:User {name:"${name}"}) RETURN p` //Checks if it created the connection, if it doesnt returns null
         const confirmResult: QueryResult = await neo().executeRead(tx => tx.run(queryXConfirm))
         const confirm: string[] = confirmResult.records.map((row: any) => row.get("p"))
         if (confirm[0] === null) resolve(null)
         else resolve(name[0])
      })
   }

   //Setta l'amicizia tramite la funzione di supernova, deve essere chiamata solamente dal cron job
   public setSupernovaFriendship = (username: string): Promise<string> => {
      return new Promise(async (res, rej) => {
         supernova(username).then(async (string: string) => {
            const friendUsername = string
            const querySupernovaBinding: string = `MATCH (u:User {name : "${username}"}), (t:User {name : "${friendUsername}"}) MERGE (u)-[r:supernovaBind]-(t) SET r.time = ${Date.now()}`

            const result: QueryResult = await neo().executeWrite(tx => tx.run(querySupernovaBinding))
            const relationshipCode: string[] = result.records.map((row: any) => row.get("r.id"))
            return res(relationshipCode[0])
         })
            .catch((error) => {
               if (error.message === "User not found") {
                  return rej(err("User not found"))
               } else if (error.message === "Impossible to find new friends") {
                  return rej(err("Impossible to find new friends"))
               }
            })

      })
   }

   //Controlla lo stato dell'amicizia supernova, se nessuno dei due ha accettato l'amicizia, se uno solo ha accettato l'amicizia o se uno dei due l'ha rifiutata
   public checkSupernovaFriendship = (username: string): Promise<SupernovaResponse> => {
      return new Promise(async (res, rej) => {
         const querySupernovaBinding: string = `OPTIONAL MATCH (u:User {name : "${username}"})-[r:supernovaBind]-(t:User) RETURN t.name,r UNION OPTIONAL MATCH (u:User {name : "${username}"})-[r:oneWaysupernovaBind]-(t:User) RETURN t.name,r UNION OPTIONAL MATCH (u:User {name : "${username}"})-[r:RefusedsupernovaBind]-(t:User) RETURN t.name,r`

         const resultFriend: QueryResult = await neo().executeRead(tx => tx.run(querySupernovaBinding))
         let friendName: string = ""
         let status: any = ""
         let oneway: string = ""

         resultFriend.records.forEach(record => {
            if (record.get("t.name") != null) {
               friendName = record.get("t.name")
               status = record.get("r")
               oneway = status.properties["oneway"]
            }
         })
         if (status.type === "" || undefined)
            return rej(err("No binding found"))

         if (friendName == "") {
            return rej(err("No Supernova")) //This is given when there is no supernova associated at the user
         } else {
            const returnValue: SupernovaResponse = { username: friendName, status: status.type, oneway: oneway }
            return res(returnValue)
         }
      })
   }

   public oneWaySupernovaFriendship = (username: string, supernovaState: SupernovaResponse, accepted: boolean): Promise<string> => {
      return new Promise(async (res, rej) => {
         if (supernovaState.status === "supernovaBind" && accepted === true) { // Se è stato trovato il binding di supernova e lo accetto
            const querySupernovaOneWaySetter: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:supernovaBind]-(t:User) DELETE r MERGE (u)-[d:oneWaysupernovaBind]-(t) SET d.oneway = "${username}"`
            await neo().executeWrite(tx => tx.run(querySupernovaOneWaySetter))
            return res("One way Binding Created")
         } else if (supernovaState.status === "oneWaysupernovaBind" && supernovaState.oneway === username) { // Se trovo che ho già accettato la supernova
            return rej(err("Already accepted friendship"))
         } else if (supernovaState.status === "refusedSupernova") { // Se trovo la relazione rifiutata
            return rej(err("Refused Supernova"))
         } else if (supernovaState.status === "oneWaysupernovaBind" && supernovaState.oneway != username && accepted) { // Se trovo che è già stato accettato il supernova dall'altra persona
            const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:Friend]-(t)`
            await neo().executeWrite(tx => tx.run(queryFriendshipCreated))
            return res("Friendship Created")
         } else if (supernovaState.status === "oneWaysupernovaBind" && supernovaState.oneway != username && !accepted) { // Se è già stata accettata la supernova e non sono io e la rifiuto
            const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:refusedSupernova]-(t)`
            await neo().executeWrite(tx => tx.run(queryFriendshipCreated))
            return res("Supernova Blocked")
         } else if (supernovaState.status === "supernovaBind" && !accepted) { // Se è stato creato un supernova binding e non lo accetto
            const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:refusedSupernova]-(t)`
            await neo().executeWrite(tx => tx.run(queryFriendshipCreated))
            return res("Supernova Blocked")
         }
      })
   }

}
