import neo4j from '@config/neo4j.config';
import { checkIfAccessTokenIsValid } from "@helpers/middlewares";
import { Request, Response, Router } from "express";
import admin from 'firebase-admin';

const app: Router = Router();

app.post("/", (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization as string
   const username = req.body.username
   const interests = req.body.interests
   const bday = req.body.bday
   const name = req.body.name
   const pfp = req.body.pfp

   checkIfAccessTokenIsValid(authorization).then((uid) => { //check if firebase access token is valid
      createDoc(uid, username, name, pfp).then(() => { //create a new doc in /users
         createNode(uid, interests, bday).then(() => { //create a new node in neo4j
            res.json({ success: true, message: "Node & Document created" }).status(201);
         }).catch((error) => {
            res.json({ success: false, message: error.message }).status(500);
         })
      }).catch((error) => {
         res.json({ success: false, message: error.message }).status(400);
      })
   }).catch((error) => {
      res.json({ success: false, message: error.message }).status(401)
   })
})

async function createDoc(uid: string, username: string, name: string, pfp: string) {
   const db = admin.firestore();
   const usersRef = db.collection('users').where("username", "==", username); //search where the username is equal to the input username

   return new Promise((resolve, reject) => {
      usersRef.get()
         .then(async (snapshot) => {
            if (snapshot.empty) { //check if username is already used
               const docRef = db.collection('users').doc(uid);
               await docRef.set({ //set the user data into the doc
                  username: username,
                  name: name,
                  pfp: pfp
               });
               resolve(null); //return nothing
            } else
               reject(new Error('Username already exists'));
         })
   })
}

async function createNode(uid: string, interests: string[], bday: string[]) {
   //TODO: @TheInfernalNick usa Promise((resolve, reject) per restituire gli errori per il catch (guarda createDoc)
   if (neo4j) {
      const query = `CREATE (:User {name:"${uid}",interests:"${interests}",bday:"${bday}"})`
      const result = await neo4j.executeWrite(tx => tx.run(query))
   } else
      throw new Error('Driver not found')
}

export default app
