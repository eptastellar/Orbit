import { NextFunction, Request, Response, Router } from "express";
import admin from 'firebase-admin';

const app: Router = Router();

app.post("/upload", async (req: Request, res: Response, next: NextFunction) => {
   const uid = res.locals.uid
   const text = req.body.text
   const content = req.body.content

   const db = admin.firestore()
   const docRef = db.collection('posts').doc() //set the docRef to posts

   docRef.set({ //set the post information in firestore
      owner: uid,
      text: text,
      content: content,
      likes_number: 0,
      comments_number: 0,
   }).then(() => {
      res.json({ success: true, message: 'Created', post: docRef.id }).status(201); //return the post id
   }).catch(() => {
      res.json({ success: false, message: 'Invalid input' }).status(500);
   })
});

app.get("/download/:id", async (req: Request, res: Response, next: NextFunction) => {
   const id = req.params.id;

   const db = admin.firestore()
   const docRef = db.collection('posts').doc(id) //set the docRef to posts

   const doc = await docRef.get();
   if (doc.exists) { //if the document exists
      const { username, name, pfp } = await retriveUserData(doc.data()?.owner) //retrive post owner informations
      const content = doc.data()?.content
      const text = doc.data()?.text
      const likes_number = doc.data()?.likes_number
      const comments_number = doc.data()?.comments_number

      res.json({
         text: text,
         content: content,
         likes_number: likes_number,
         comments_number: comments_number,
         created: doc.createTime?.seconds,
         username: username,
         name: name,
         pfp: pfp,
      }).status(200)
   } else
      res.json({ success: false, message: 'Post doesn\'t exists' }).status(400)
});

async function retriveUserData(uid: string) { //retrive owner informations based from the uid
   const db = admin.firestore()
   const docRef = db.collection('users').doc(uid)
   const doc = await docRef.get()

   const username = doc.data()?.username
   const name = doc.data()?.name
   const pfp = doc.data()?.pfp

   return { username, name, pfp }
}

export default app;
