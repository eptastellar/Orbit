import { generateJWT } from "@helpers/jwt";
import { checkIfAccessTokenIsValid } from "@helpers/middlewares";
import { Request, Response, Router } from "express";
import admin from 'firebase-admin';

const app: Router = Router();

app.get("/", (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization as string

   checkIfAccessTokenIsValid(authorization).then(async (uid: string) => { //send the firebase access token to create a session
      createNewSession(uid).then((jwt: string) => {
         res.json({ success: true, jwt: jwt, uid: uid }).status(200) //return the session jwt and the uid
      })
   }).catch((error) => {
      res.json({ success: false, message: error.message }).status(401)
   })
});

async function createNewSession(uid: string): Promise<string> {
   const jwt = await generateJWT(uid)
   const db = admin.firestore();

   const docRef = db.collection('sessions').doc(uid); //create a new doc in the collection /sessions
   await docRef.set({ //save the token in the session
      token: jwt
   })

   return jwt;
}

export default app;
