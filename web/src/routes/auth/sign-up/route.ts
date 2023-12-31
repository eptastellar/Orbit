import neo4j from "@config/neo4j.config";
import { NextFunction, Request, Response, Router } from "express";
import admin from 'firebase-admin';

const app: Router = Router();

app.post("/", (req: Request, res: Response, next: NextFunction) => {
   const uid = req.body.uid
   const username = req.body.username
   const interests = req.body.interests
   const bday = req.body.bday

   createDoc(uid, username).then(() => { //create a new doc in /users
      createNode(uid, interests, bday).then(() => { //create a new node in neo4j
         res.json({ success: true, message: "Node & Document created" }).status(201);
      }).catch((error) => {
         res.json({ success: false, message: error.message }).status(500);
      })
   }).catch((error) => {
      res.json({ success: false, message: error.message }).status(500);
   })
})

async function createDoc(uid: string, username: string) {
   const db = admin.firestore();
   const usersRef = db.collection('users').where("username", "==", username);

   return new Promise((resolve, reject) => {
      usersRef.get()
         .then(async (snapshot) => {
            if (snapshot.empty) { //check if username is already used
               const docRef = db.collection('users').doc(uid);
               await docRef.set({
                  username: username,
               });
               resolve(null);
            } else
               reject(new Error('Username already exists'));
         })
   })
}

async function createNode(uid: string, interests: string[], bday: string[]) {
   if (neo4j) {
      const query = `CREATE (:User {name:"${uid}",interests:"${interests}",bday:"${bday}"})`
      const result = await neo4j.executeWrite(tx => tx.run(query))
   } else
      throw new Error('Driver not found')
}

export default app
