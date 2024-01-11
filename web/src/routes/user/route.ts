import neo4j from "@config/neo4j.config"
import { retrieveUIDFromUsername, retrieveUserDataFromUID } from "@helpers/retriever"
import { Request, Response, Router } from "express"
import admin from 'firebase-admin'
import { DocumentData, DocumentReference, Firestore, Query, QuerySnapshot } from "firebase-admin/firestore"

const app: Router = Router()

app.get("/:username", async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const username: string = req.params.username

   retrieveUIDFromUsername(username).then(async (uid: string) => {
      const db: Firestore = admin.firestore()
      let personal: boolean = false

      if (tokenUid == uid) //check if is user personal profile
         personal = true

      const docRef: DocumentReference = db.collection('users').doc(uid)
      const doc: DocumentData = (await docRef.get()).data()! //retrive user data from firestore

      const friend_count: number = await getFriendCount(uid)
      const post_count: number = await getPostCount(uid)
      const meteor_count: number = await getMeteorCount(uid)

      res.json({
         success: true,
         status: 200,
         personal: personal,
         username: doc.username,
         name: doc.name,
         pfp: doc.pfp,
         counters: {
            post_count: post_count,
            friend_count: friend_count,
            meteor_count: meteor_count,
         }
      })
   }).catch((error) => {
      res.json({ success: false, status: 400, message: error.message })
   })
})

app.get("/:username/posts", async (req: Request, res: Response) => {
   const db: Firestore = admin.firestore()
   const index: string = req.body.lastDocId //retrieve the last fetched document
   const docRef = db.collection('posts').doc(index) //TODO: need to fix
   const incremental: number = 5

   const uid: string = await retrieveUIDFromUsername(req.params.username) //get the uid from the username
   const { username, name, pfp } = await retrieveUserDataFromUID(uid) //get all the user data

   const postsRef = db.collection('posts')
      .where("owner", "==", uid)
      .orderBy('createdAt', 'desc')
      .startAfter(docRef) //start after the last document fetched
      .limit(incremental) //the number of document to retrieve each request

   const snapshot: QuerySnapshot = await postsRef.get()
   const doc: DocumentData = snapshot.docs[snapshot.docs.length - 1] //the last document info
   const lastDocId = doc._ref._path.segments[1]

   const posts = snapshot.docs.map(doc => ( //map all the posts
      {
         id: doc.id,
         creation: doc.createTime.seconds,
         type: doc.data().type,
         content: doc.data().content,
         likes_number: doc.data().likes_number,
         //TODO: comments_number: doc.data().comments_number,
         user_data: {
            username: username,
            name: name,
            pfp: pfp,
         }
      }
   ))

   if (posts.length != 0)
      res.json({ success: true, status: 200, posts: posts, lastDocId: lastDocId }) //also return the last doc id for new requests
   else
      res.json({ success: null, status: 204, message: "No Content" }) //no content response
})

async function getFriendCount(uid: string): Promise<number> {
   return new Promise<number>(async (resolve, reject) => {
      const query: string = `MATCH (u:User)-[:Friend]-(t:User) where u.name = "${uid}" RETURN t`
      if (neo4j) {
         const resultQueryFriends = await neo4j.executeWrite(tx => tx.run(query))
         let friends = resultQueryFriends.records.map(row => row.get('t'))
         resolve(friends.length)
      }
      reject(new Error("Driver not Found"))
   })
}

async function getPostCount(uid: string): Promise<number> { //get the snapshot size of all the posts where uid is equal to the owner
   const db: Firestore = admin.firestore()

   const postsRef: Query = db.collection('posts').where("owner", "==", uid)
   const snapshot: QuerySnapshot = await postsRef.get()
   return snapshot.size
}

async function getMeteorCount(uid: string): Promise<number> {
   //TODO
   return 0
}

export default app
