import { retrieveUserDataFromUID } from '@helpers/retriever';
import { Request, Response, Router } from "express";
import admin from 'firebase-admin';
import { DocumentData, DocumentReference, Firestore } from 'firebase-admin/firestore';

const app: Router = Router();

app.post("/upload", async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const type: string = req.body.type
   const content: string = req.body.content

   const db: Firestore = admin.firestore()
   const docRef: DocumentReference = db.collection('posts').doc() //set the docRef to posts

   docRef.set({ //set the post information in firestore
      owner: uid,
      type: type,
      content: content,
      likes_number: 0,
      // comments_number: 0, //TODO
      createdAt: Date.now() //unix format
   }).then(() => {
      res.json({ success: true, status: 201, message: 'Created', post: docRef.id }) //return the post id
   }).catch(() => {
      res.json({ success: false, status: 500, message: 'Invalid input' })
   })
});

app.get("/download/:id", async (req: Request, res: Response) => { //get the specific post based from is id
   const id: string = req.params.id;

   const db: Firestore = admin.firestore()
   const docRef: DocumentReference = db.collection('posts').doc(id) //set the docRef to posts and id

   const doc: DocumentData = await docRef.get();
   if (doc.exists) { //if the document exists
      const { username, name, pfp } = await retrieveUserDataFromUID(doc.data()?.owner) //retrive post owner informations
      const content: string = doc.data()?.content
      const type: string = doc.data()?.type
      const likes_number: number = doc.data()?.likes_number
      // const comments_number = doc.data()?.comments_number

      res.json({
         success: true,
         status: 200,
         type: type,
         content: content,
         likes_number: likes_number,
         //TODO comments_number: comments_number,
         created: doc.createTime.seconds,
         username: username,
         name: name,
         pfp: pfp,
      })
   } else
      res.json({ success: false, status: 400, message: 'Post doesn\'t exists' })
});

export default app;
