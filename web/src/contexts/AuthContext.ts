import { firebase } from '@config/firebase-admin.config'
import { neo } from '@config/neo4j.config'
import { randomProfilePicture } from '@contexts/ContentContext'
import { isValidSignUpUsername } from '@helpers/validate'
import express, { NextFunction } from 'express'
import admin, { firestore } from 'firebase-admin'
import { DocumentData, DocumentReference, DocumentSnapshot, Firestore } from 'firebase-admin/firestore'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import { Session } from 'neo4j-driver'

firebase()
const neo4j: Session = neo()
const db: Firestore = firestore()

export const checkIfSessionTokenIsValid = async (req: express.Request, res: express.Response, next: NextFunction) => {
   const authorization: string = req.headers.authorization!

   isValidSessionJWT(authorization).then((payload: JWTPayload) => { //validate if the token is signed
      const uid: string = payload.uid as string

      const docRef: DocumentReference = db.collection('sessions').doc(uid)
      const jwt: string = authorization.split('Bearer ')[1]

      docRef.get().then(async (snapshot: DocumentSnapshot) => {
         if (jwt == snapshot.data()?.jwt) { //check if the token is the same saved in firestore
            res.locals.uid = uid //save the uid of the user to manipulate only his data
            next()
         } else throw new Error('auth/invalid-token')
      }).catch((error: Error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(401).json({ success: false, message: error.message }) })
}

export async function checkIfAccessTokenIsValid(authorization: string): Promise<string> {
   return new Promise(async (resolve, reject) => {
      try {
         const jwt: string = authorization.split('Bearer ')[1] //remove bearer from the authentication param
         const decodedjwt: DecodedIdToken = await admin.auth().verifyIdToken(jwt) //verify token using firebase, it also check if the token is expired

         if (decodedjwt.email_verified) { //check if the email is verified
            const uid: string = decodedjwt.uid
            resolve(uid) //return the uid of the user
         } else reject(new Error('auth/email-unverified'))
      } catch (error) { reject(new Error('auth/invalid-token')) }
   })
}

export const checkIfCronSecretIsValid = async (req: express.Request, res: express.Response, next: NextFunction) => {
   const authorization: string = req.headers.authorization!
   const secret: string = authorization.split('Bearer ')[1]

   try {
      if (secret == process.env.CRON_SECRET)
         next()
      else res.status(400).json({ success: false, message: 'auth/invalid-token' })
   } catch { res.status(400).json({ success: false, message: 'auth/invalid-token' }) }
}

export async function newSessionJWT(uid: string) {
   const payload = { 'uid': uid }

   const jwt = new SignJWT(payload)
   jwt.setProtectedHeader({ alg: 'HS256' })
   jwt.setIssuedAt()
   jwt.setExpirationTime('4w') //create a jwt and set the expire time to 4 weeks

   const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
   const signedJwt = await jwt.sign(secret)

   return signedJwt
}

export async function isValidSessionJWT(token: string): Promise<JWTPayload> {
   return new Promise(async (resolve, reject) => {
      try {
         const jwt: string = token.split('Bearer ')[1]
         const secret: Uint8Array = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
         const { payload } = await jwtVerify(jwt, secret) //validate the user token and return the user payload

         if (payload.exp! < Date.now() / 1000) //check if the token is expired
            reject(new Error('auth/expired-token'))

         resolve(payload) //return the token payload
      } catch { reject(new Error('auth/invalid-token')) }
   })
}

export async function createNewSession(uid: string): Promise<string> {
   const docRef: DocumentReference = db.collection('sessions').doc(uid) //create a new doc in the collection /sessions
   const doc: DocumentData = (await docRef.get()).data()! //get data inside the document
   const token: string = doc?.token

   return new Promise(async (resolve, reject) => {
      if (token) {
         isValidSessionJWT(token).then(async () => {
            resolve(token) //if the token is still valid return it
         }).catch(async (error) => {
            await docRef.set({ jwt: null })
            reject(error);
         })
      } else resolve(await refreshSession(docRef, uid)) //if the document is empty refresh the session
   })
}

export async function refreshSession(docRef: DocumentReference, uid: string): Promise<string> {
   const jwt: string = await newSessionJWT(uid) //generate a new session token

   await docRef.set({ jwt }) //refresh the token in the session token:
   return jwt
}

export async function checkIfDocumentExists(uid: string): Promise<null> {
   return new Promise((resolve, reject) => {

      const docRef: DocumentReference = db.collection('users').doc(uid)

      docRef.get().then((doc: DocumentData) => {
         if (doc.exists)
            resolve(null)
         else reject(new Error('auth/user-not-signed-up')) //if the document doesn't exists in firestore
      }).catch(() => { reject(new Error('auth/user-not-signed-up')) }) //if the document doesn't exists in firestore
   })
}

export async function createDoc(uid: string, username: string, pfp: string, bday: number): Promise<null> {
   return new Promise((resolve, reject) => {
      isValidSignUpUsername(username).then(async () => {
         const name: string = username.substring(1)
         const docRef: DocumentReference = db.collection('users').doc(uid)

         if (!(await docRef.get()).exists) { //check if the user is already registered to prevent rewrites
            pfp = pfp ? pfp : await randomProfilePicture() //set the pfp url to the one sent from the client, or if is null, select a random one

            await docRef.set({ //set the user data into the doc
               username: username,
               name: name,
               pfp: pfp,
               bday: bday
            })
            resolve(null) //return nothing
         } else reject(new Error('auth/user-already-exists'))
      }).catch((error) => { reject(error) })
   })
}

export async function createNode(uid: string, interests: string[]): Promise<null> {
   return new Promise(async (resolve, reject) => {
      try {
         const query = `MERGE (:User {name:'${uid}',interests:'${interests}'})`
         await neo4j.executeWrite(tx => tx.run(query))
         resolve(null)
      } catch { reject(new Error('server/driver-not-found')) }
   })
}
