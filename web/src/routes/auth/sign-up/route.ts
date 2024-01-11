import neo4j from '@config/neo4j.config'
import { createNewSession } from '@helpers/jwt'
import { checkIfAccessTokenIsValid } from "@helpers/middlewares"
import { isValidBday, isValidUsername } from '@helpers/validate'
import { Request, Response, Router } from "express"
import admin from 'firebase-admin'
import { DocumentReference, Firestore } from 'firebase-admin/firestore'

const app: Router = Router();

app.post("/", (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization!
   const username: string = req.body.username
   const interests: string[] = req.body.interests
   const bday: number = req.body.bday
   const name: string = req.body.name
   const pfp: string = req.body.pfp

   checkIfAccessTokenIsValid(authorization).then((uid: string) => { //check if firebase access token is valid
      createDoc(uid, username, name, pfp, bday).then(() => { //create a new doc in /users
         createNode(uid, interests).then(() => { //create a new node in neo4j
            createNewSession(uid).then((jwt: string) => {
               res.json({ success: true, status: 200, jwt: jwt, username: username }) //return the session jwt and the username of the user for the frontend side
            })
         }).catch((error) => {
            res.json({ success: false, status: 500, message: error.message })
         })
      }).catch((error) => {
         res.json({ success: false, status: 400, message: error.message })
      })
   }).catch((error) => {
      res.json({ success: false, status: 401, message: error.message })
   })
})

app.post('/validate', (req: Request, res: Response) => {
   const username: string = req.body.username
   const bday: number = req.body.bday
   
   isValidUsername(username).then(() => {
      isValidBday(bday).then(() => {
         res.json({ success: true, status: 200 })
      }).catch((error) => {
         res.json({ success: false, status: 400, message: error.message })
      })
   }).catch((error) => {
      res.json({ success: false, status: 400, message: error.message })
   })
})

async function createDoc(uid: string, username: string, name: string, pfp: string, bday: number): Promise<null> {
   return new Promise((resolve, reject) => {
      isValidUsername(username).then(async () => {
         const db: Firestore = admin.firestore()
         const docRef: DocumentReference = db.collection('users').doc(uid)

         pfp = pfp ? pfp : await getDefaultRandomProfilePicture()  //set the pfp url to the one sent from the client, or if is null, select a random one

         await docRef.set({ //set the user data into the doc
            username: username,
            name: name,
            pfp: pfp,
            bday: bday
         });
         resolve(null) //return nothing
      }).catch((error) => {
         reject(error)
      })
   })
}

async function createNode(uid: string, interests: string[]): Promise<null> {
   return new Promise(async (resolve, reject) => {
      if (neo4j) {
         const query = `CREATE (:User {name:"${uid}",interests:"${interests}"})`
         await neo4j.executeWrite(tx => tx.run(query))
         resolve(null)
      } else
         reject(new Error('server/driver-not-found'))
   })
}

async function getDefaultRandomProfilePicture(): Promise<string> {
   const bucket = admin.storage().bucket()
   const prefix: string = 'default/pfps'

   return new Promise((resolve, reject) => {
      bucket.getFiles({ prefix: prefix }, (err, files) => { // get the files from the bucket with the defined prefix
         if (err)
            reject(err);

         const urls: string[] = [];
         if (files) {
            files.splice(0, 1) // remove the first file from the files array

            Promise.all(
               files.map(file => // map over the files array and create a new promise for each file
                  file.getSignedUrl({
                     action: 'read',
                     expires: Date.now() + 30 * 24 * 60 * 60 * 1000 * 12 * 10, // expiration set to 10 years from now
                  })
               )
            ).then(results => {
               results.forEach(result => { // push the result of each promise (the generated URL) into the urls array
                  urls.push(result[0]);
               });
               resolve(urls[Math.floor(Math.random() * urls.length)]); // resolve the promise with a random URL from the urls array
            });
         }
      });
   });
}

export default app
