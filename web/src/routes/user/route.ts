import neo4j from "@config/neo4j.config"
import { retrieveUIDFromUsername, retrieveUserDataFromUID } from "@helpers/retriever"
import { isValidLastDocId } from "@helpers/validate"
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
   const db: Firestore = admin.firestore();
   const lastDocId: string = req.body.lastDocId; //retrieve the last fetched document
   const incremental: number = 3;

   isValidLastDocId(lastDocId).then(() => {
      retrieveUIDFromUsername(req.params.username).then(async (uid: string) => { //get the uid from the username
         getUserPosts(uid, lastDocId).then((fetch) => {
            res.json({ success: true, status: 200, posts: fetch.posts, lastDocId: fetch.lastDocId })
         }).catch((error) => { res.json({ success: false, status: 204, message: error.message }) })
      }).catch((error) => { res.json({ success: false, status: 404, message: error.message }) });
   }).catch((error) => { res.json({ success: false, status: 400, message: error.message }) })
});


async function getFriendCount(uid: string): Promise<number> {
   return new Promise<number>(async (resolve, reject) => {
      const query: string = `MATCH (u:User)-[:Friend]-(t:User) where u.name = "${uid}" RETURN t`
      if (neo4j) {
         const resultQueryFriends = await neo4j.executeWrite(tx => tx.run(query))
         let friends = resultQueryFriends.records.map(row => row.get('t'))
         resolve(friends.length)
      }
      reject(new Error("server/driver-not-found"))
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

type Fetch = {
   posts: DocumentData[]
   lastDocId: string
}

async function getUserPosts(uid: string, lastDocId: string): Promise<Fetch> {
   return new Promise(async (resolve, reject) => {
      const db: Firestore = admin.firestore()
      const incremental: number = 3

      let docRef: Query = db.collection("posts")
         .where("owner", "==", uid)
         .orderBy("createdAt", "desc")
         .limit(incremental);

      if (lastDocId) {
         const lastDoc: DocumentData = await db.collection('posts').doc(lastDocId).get()
         docRef = docRef.startAfter(lastDoc);
      }

      const snapshot: DocumentData = await docRef.get();
      const { username, name, pfp } = await retrieveUserDataFromUID(uid); //get all the user data

      const posts: DocumentData[] = snapshot.docs.map((doc: DocumentData) => ({ //map all the posts
         id: doc.id,
         creation: doc.createTime.seconds,
         type: doc.data().type,
         content: doc.data().content,
         likes_number: doc.data().likes_number,

         user_data: {
            username: username,
            name: name,
            pfp: pfp,
         },
      }))

      if (posts.length > 0) {
         const lastDocId: string = snapshot.docs[snapshot.docs.length - 1].ref.id
         const fetch: Fetch = { posts, lastDocId }
         resolve(fetch)
      } else
         reject(new Error('resource/no-content'))
   })
}

export default app
