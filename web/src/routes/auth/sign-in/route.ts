import { baas } from "@config/firebase-admin.config";
import { generateJWT } from "@helpers/jwt";
import { Request, Response, Router } from "express";
import admin from 'firebase-admin';

const app: Router = Router();

app.get("/", (req: Request, res: Response) => {
   const authorization = req.headers.authorization
   //TODO MAX ACCESS X IP
   if (authorization?.startsWith("Bearer "))
      checkIfTokenIsValid(authorization).then(async (uid: string) => { //send the firebase access token to create a session
         const jwt: string = await generateJWT(uid)
         createNewSession(uid, jwt).then(() => {
            res.json({ success: true, jwt: jwt }).status(200)
         })
      }).catch((error) => {
         res.json({ success: false, message: error.message }).status(401)
      })
   else
      res.json({ success: false, message: "Unauthorized" }).status(401)
});

async function checkIfTokenIsValid(authorization: string): Promise<string> {
   return new Promise(async (resolve, reject) => {
      try {
         baas()
         const jwt = authorization.split("Bearer ")[1]
         const decodedjwt = await admin.auth().verifyIdToken(jwt) //verify using firebase
         const uid: string = decodedjwt.uid
         resolve(uid)
      } catch (error) {
         reject(new Error('Invalid token'))
      }
   })
}

async function createNewSession(uid: string, jwt: string) {
   const db = admin.firestore();
   const docRef = db.collection('sessions').doc(uid); //create a new doc in the collection /sessions

   await docRef.set({
      token: jwt,
   });
}

export default app;
