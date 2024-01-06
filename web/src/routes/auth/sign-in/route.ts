import { generateJWT } from "@helpers/jwt";
import { checkIfAccessTokenIsValid } from "@helpers/middlewares";
import { retrieveUserDataFromUID } from "@helpers/retriever";
import { Request, Response, Router } from "express";
import admin from 'firebase-admin';

const app: Router = Router();

app.get("/", (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization as string

   checkIfAccessTokenIsValid(authorization).then(async (uid: string) => { //send the firebase access token to create a session
      createNewSession(uid).then((jwt: string) => {
         retrieveUserDataFromUID(uid).then((promise) => {
            const username = promise.username
            res.json({ success: true, jwt: jwt, username: username }).status(200) //return the session jwt and the username of the user for the frontend side
         })
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
