import { Request, Response, Router } from "express";
import admin from 'firebase-admin';

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
   //TODO @TheInfernalNick return the list of friends uid
   return []
}

export default app;
