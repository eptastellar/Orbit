import { createNewSession } from "@helpers/jwt";
import { checkIfAccessTokenIsValid } from "@helpers/middlewares";
import { retrieveUserDataFromUID } from "@helpers/retriever";
import { Request, Response, Router } from "express";
import admin from 'firebase-admin';
import { DocumentData, DocumentReference, Firestore } from 'firebase-admin/firestore';

const app: Router = Router();

app.get("/", (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization!

   checkIfAccessTokenIsValid(authorization).then(async (uid: string) => { //send the firebase access token to create a session
      checkIfDocumentExists(uid).then(() => { //check if the user is fully signed up even in firestore
         createNewSession(uid).then((jwt: string) => { //create a multiaccess session using jwt
            retrieveUserDataFromUID(uid).then((promise) => {
               const username = promise.username
               res.json({ success: true, status: 200, jwt: jwt, username: username }) //return the session jwt and the username of the user for the frontend side
            })
         })
      }).catch((error) => {
         res.json({ success: false, status: 401, message: error.message })
      })
   }).catch((error) => {
      res.json({ success: false, status: 401, message: error.message })
   })
});

async function checkIfDocumentExists(uid: string): Promise<null> {
   return new Promise((resolve, reject) => {
      const db: Firestore = admin.firestore();
      const docRef: DocumentReference = db.collection('users').doc(uid);

      docRef.get().then((doc: DocumentData) => {
         if (doc.exists)
            resolve(null);
         else
            reject(new Error('auth/user-not-signed-up')); //if the document doesn't exists in firestore
      }).catch(() => {
         reject(new Error('auth/user-not-signed-up')); //if the document doesn't exists in firestore
      });
   });
}



export default app;
