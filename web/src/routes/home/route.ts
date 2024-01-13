import neo from "@config/neo4j.config";
import { Request, Response, Router } from "express";
import admin from "firebase-admin";

const app: Router = Router();

app.get("/unreaded", (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   //TODO
   // unreaded messages number
   res.json({}).status(200)
});

app.get("/posts", async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const db = admin.firestore()

   const friendList = await getFriendList(uid)
   //TODO
   // posts of friends ordered by date of creation
   res.json({}).status(200)
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

export default app;
