import { retriveUserDataFromUID } from '@helpers/retriver';
import { Request, Response, Router } from "express";
import admin from 'firebase-admin';

const app: Router = Router();

app.post("/upload", async (req: Request, res: Response) => {
   const uid = res.locals.uid
   const type = req.body.type
   const content = req.body.content

   const db = admin.firestore()
   const docRef = db.collection('posts').doc() //set the docRef to posts

   docRef.set({ //set the post information in firestore
      owner: uid,
      type: type,
      content: content,
      likes_number: 0,
      // comments_number: 0, //TODO
   }).then(() => {
      res.json({ success: true, message: 'Created', post: docRef.id }).status(201); //return the post id
   }).catch(() => {
      res.json({ success: false, message: 'Invalid input' }).status(500);
   })
});

app.get("/download/:id", async (req: Request, res: Response) => { //get the specific post based from is id
   const id = req.params.id;

   const db = admin.firestore()
   const docRef = db.collection('posts').doc(id) //set the docRef to posts and id

   const doc = await docRef.get();
   if (doc.exists) { //if the document exists
      const { username, name, pfp } = await retriveUserDataFromUID(doc.data()?.owner) //retrive post owner informations
      const content = doc.data()?.content
      const text = doc.data()?.text
      const likes_number = doc.data()?.likes_number
      // const comments_number = doc.data()?.comments_number

      res.json({
         text: text,
         content: content,
         likes_number: likes_number,
         //TODO comments_number: comments_number,
         created: doc.createTime?.seconds,
         username: username,
         name: name,
         pfp: pfp,
      }).status(200)
   } else
      res.json({ success: false, message: 'Post doesn\'t exists' }).status(400)
});

export default app;
