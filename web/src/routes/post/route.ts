import { NextFunction, Request, Response, Router } from "express";
import admin from 'firebase-admin';

const app: Router = Router();

app.post("/upload", async (req: Request, res: Response, next: NextFunction) => {
   const uid = res.locals.uid
   const text = req.body.text
   const content = req.body.content

   const db = admin.firestore()
   const docRef = db.collection('posts').doc()

   docRef.set({
      owner: uid,
      text: text,
      content: content,
      created: Date.now()
   }).then(() => {
      res.json({ success: true, message: 'Created' }).status(201);
   }).catch(() => {
      res.json({ success: false, message: 'Invalid input' }).status(500);
   })
});

export default app;
