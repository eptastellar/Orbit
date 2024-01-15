import neo from "@config/neo4j.config";
import { retrieveUserDataFromUID } from "@helpers/retriever";
import { isValidLastDocId } from "@helpers/validate";
import { Request, Response, Router } from "express";
import admin from "firebase-admin";
import { DocumentData, Firestore, Query } from "firebase-admin/firestore";

const app: Router = Router();

app.get("/unreaded", (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   //TODO
   // unreaded messages number
   res.json({}).status(200)
});

app.post("/posts", async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const lastDocId: string = req.body.lastDocId

   isValidLastDocId(lastDocId).then(async () => {
      const friendList: string[] = await getFriendList(uid)

      getPostOfFriends(friendList, lastDocId).then((fetch) => {
         res.json({ success: true, status: 200, posts: fetch.posts, lastDocId: fetch.lastDocId })
      }).catch((error) => { res.json({ success: false, status: 204, message: error.message }) })
   }).catch((error) => { res.json({ success: false, status: 400, message: error.message }) })
});

async function getFriendList(uid: string): Promise<string[]> {
   let tempArray: string[] = []
   return new Promise(async (resolve, reject) => {
      if (neo) {
         const queryFriends = `MATCH (n:User)-[:Friend]-(p:User) where n.name = "${uid}" RETURN p`
         const resultMap = await neo.executeRead(tx => tx.run(queryFriends))
         let uids = resultMap.records.map(row => row.get("p"))
         uids.forEach(element => {
            tempArray.push(element.properties['name'])
         });
         resolve(tempArray)
      } reject(new Error("server/driver-not-found"))
   })
}

type Fetch = {
   posts: DocumentData[]
   lastDocId: string
}

async function getPostOfFriends(friendList: string[], lastDocId: string): Promise<Fetch> {
   return new Promise(async (resolve, reject) => {
      const db: Firestore = admin.firestore();
      const incremental: number = 3;

      friendList.forEach(async (friendId: string) => {
         let docRef: Query = db.collection("posts")
            .where("owner", "==", friendId)
            .orderBy("createdAt", "desc")
            .limit(incremental);

         if (lastDocId) {
            const lastDoc: DocumentData = await db.collection('posts').doc(lastDocId).get()
            docRef = docRef.startAfter(lastDoc);
         }

         const snapshot: DocumentData = await docRef.get();
         const { username, name, pfp } = await retrieveUserDataFromUID(friendId); //get all the user data

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
      });
   })
}

export default app;
