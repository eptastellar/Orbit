import { retrieveUIDFromUsername, retrieveUserDataFromUID } from "@helpers/retriever"
import { Request, Response, Router } from "express"
import admin from 'firebase-admin'

const app: Router = Router()

app.get("/:username", async (req: Request, res: Response) => {
   const tokenUid = res.locals.uid
   const username = req.params.username

   retrieveUIDFromUsername(username).then(async (uid: string) => {
      const db = admin.firestore()
      let personal = false

      if (tokenUid == uid) //check if is user personal profile
         personal = true

      const docRef = db.collection('users').doc(uid)
      const dataRef = (await docRef.get()).data() //retrive user data from firestore

      const friend_count = await getFriendCount(uid)
      const post_count = await getPostCount(uid)
      const meteor_count = await getMeteorCount(uid)

      res.json({
         success: true,
         personal: personal,
         username: dataRef?.username,
         name: dataRef?.name,
         pfp: dataRef?.pfp,
         counters: {
            post_count: post_count,
            friend_count: friend_count,
            meteor_count: meteor_count,
         }
      }).status(200)
   }).catch((error) => {
      res.json({ success: false, message: error.message }).status(400)
   })
})

app.get("/:username/posts", async (req: Request, res: Response) => {
   const index = req.body.lastDocId //retrieve the last fetched document
   const incremental = 5
   const db = admin.firestore()


   const uid = await retrieveUIDFromUsername(req.params.username) //get the uid from the username
   const { username, name, pfp } = await retrieveUserDataFromUID(uid) //get all the user data

   const postsRef = db.collection('posts')
      .where("owner", "==", uid)
      .orderBy('createdAt', 'desc')
      .startAfter(index) //start after the last document fetched
      .limit(incremental) //the number of document to retrieve each request

   const snapshot = await postsRef.get()
   const lastDocId = snapshot.docs[snapshot.docs.length - 1] //the last document info

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
      res.json({ success: true, posts: posts, lastDocId: lastDocId }).status(200) //also return the last doc id for new requests
   else
      res.json({ message: "No Content" }).status(204) //no content response
})

async function getFriendCount(uid: string): Promise<number> {
   //TODO @TheInfernalNick return the number of friends in neo4j
   return 0
}

async function getPostCount(uid: string): Promise<number> { //get the snapshot size of all the posts where uid is equal to the owner
   const db = admin.firestore()

   const postsRef = db.collection('posts').where("owner", "==", uid)
   const snapshot = await postsRef.get()
   return snapshot.size
}

async function getMeteorCount(uid: string): Promise<number> {
   //TODO
   return 0
}

export default app
