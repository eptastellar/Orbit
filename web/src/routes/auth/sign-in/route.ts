import { generateJWT, validateJWT } from "@helpers/jwt";
import { checkIfAccessTokenIsValid } from "@helpers/middlewares";
import { retrieveUserDataFromUID } from "@helpers/retriever";
import { Request, Response, Router } from "express";
import admin from 'firebase-admin';
import { DocumentReference } from 'firebase-admin/firestore';

const app: Router = Router();

app.get("/", (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization as string

   checkIfAccessTokenIsValid(authorization).then(async (uid: string) => { //send the firebase access token to create a session
      checkIfDocumentExists(uid).then(() => { //check if the user is fully signed up even in firestore
         createNewSession(uid).then((jwt: string) => {
            retrieveUserDataFromUID(uid).then((promise) => {
               const username = promise.username
               res.json({ success: true, jwt: jwt, username: username }).status(200) //return the session jwt and the username of the user for the frontend side
            })
         })
      }).catch((error) => {
         res.json({ success: false, message: error.message }).status(401)
      })
   }).catch((error) => {
      res.json({ success: false, message: error.message }).status(401)
   })
});

async function checkIfDocumentExists(uid: string) {
   return new Promise((resolve, reject) => {
      const db = admin.firestore();
      const docRef = db.collection('users').doc(uid);

      docRef.get().then((doc) => {
         if (doc.exists)
            resolve(null);
         else
            reject(new Error('Sign up first')); //if the document doesn't exists in firestore
      }).catch(() => {
         reject(new Error('Sign up first')); //if the document doesn't exists in firestore
      });
   });
}

export async function createNewSession(uid: string): Promise<string> {
   const db = admin.firestore();

   const docRef = db.collection('sessions').doc(uid); //create a new doc in the collection /sessions
   const doc = (await docRef.get()).data() //get data inside the document
   const token = doc?.token

   return new Promise(async (resolve, _) => {
      if (token) {
         validateJWT(token).then(async (decodedToken) => { //decode the token
            const expTime: number = decodedToken.exp as number * 1000

            if (Date.now() > expTime) //check if the token is expired
               resolve(await refreshSession(docRef, uid)) //if is expired create a new session token
            else
               resolve(token) //if the token is still valid return it
         })
      } else
         resolve(await refreshSession(docRef, uid)) //if the document is empty refresh the session
   })
}

async function refreshSession(docRef: DocumentReference, uid: string): Promise<string> {
   const jwt = await generateJWT(uid) //generate a new session token

   await docRef.set({ //refresh the token in the session
      token: jwt
   })

   return jwt
}

export default app;
