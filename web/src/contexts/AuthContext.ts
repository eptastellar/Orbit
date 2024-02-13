import { err } from '@config/error'
import { firebase } from '@config/firebase-admin.config'
import { neoStart } from '@config/neo4j.config'
import { randomProfilePicture } from '@contexts/ContentContext'
import { UserInfo } from '@local-types/index'
import express, { NextFunction } from 'express'
import admin, { firestore } from 'firebase-admin'
import { DocumentData, DocumentReference, DocumentSnapshot, Firestore } from 'firebase-admin/firestore'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import { Session } from 'neo4j-driver'

firebase()
const db: Firestore = firestore()

export const checkIfSessionTokenIsValid = async (req: express.Request, res: express.Response, next: NextFunction) => {
   const authorization: string = req.headers.authorization!

   const token: string = authorization.split('Bearer ')[1]
   jwtValidation(token).then((payload: JWTPayload) => { //validate if the token is signed
      const uid: string = payload.uid as string

      const docRef: DocumentReference = db.collection('sessions').doc(uid)
      const jwt: string = authorization.split('Bearer ')[1]

      docRef.get().then(async (snapshot: DocumentSnapshot) => {
         if (jwt == snapshot.data()?.jwt) { //check if the token is the same saved in firestore
            res.locals.uid = uid //save the uid of the user to manipulate only his data
            next()
         } else throw err('auth/invalid-token')
      }).catch((error: Error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(401).json({ success: false, message: error.message }) })
}

export const checkIfAccessTokenIsValid = async (authorization: string): Promise<string> => {
   return new Promise(async (resolve, reject) => {
      try {
         const jwt: string = authorization.split('Bearer ')[1] //remove bearer from the authentication param
         const decodedjwt: DecodedIdToken = await admin.auth().verifyIdToken(jwt) //verify token using firebase, it also check if the token is expired

         if (decodedjwt.email_verified) { //check if the email is verified
            const uid: string = decodedjwt.uid
            resolve(uid) //return the uid of the user
         } else reject(err('auth/email-unverified'))
      } catch { reject(err('auth/invalid-token')) }
   })
}

export const checkIfCronSecretIsValid = async (req: express.Request, res: express.Response, next: NextFunction) => {
   try {
      const authorization: string = req.headers.authorization!
      const secret: string = authorization.split('Bearer ')[1]

      if (secret === process.env.CRON_SECRET)
         next()
      else res.status(400).json({ success: false, message: 'auth/invalid-token' })
   } catch { res.status(400).json({ success: false, message: 'auth/invalid-token' }) }
}

export const newSessionJWT = async (uid: string) => {
   const payload = { 'uid': uid }
   const secret: Uint8Array = new TextEncoder().encode(process.env.JWT_SECRET_KEY)

   const jwt: string = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' }) //TODO: enhance the security using asymmetric enc
      .setIssuedAt()
      .setExpirationTime('4w') //create a jwt and set the expire time to 4 weeks
      .sign(secret)

   return jwt
}

export const jwtValidation = (token: string): Promise<JWTPayload> => {
   return new Promise(async (resolve, reject) => {
      try {
         const secret: Uint8Array = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
         const { payload } = await jwtVerify(token, secret) //validate the user token and return the user payload
         
         if (payload.exp! < (Date.now() / 1000)) //check if the token is expired
            reject(err('auth/expired-token'))

         resolve(payload) //return the token payload
      } catch { reject(err('auth/invalid-token')) }
   })
}

export const createNewSession = async (uid: string): Promise<string> => {
   const docRef: DocumentReference = db.collection('sessions').doc(uid) //create a new doc in the collection /sessions
   const doc: DocumentData = (await docRef.get()).data()! //get data inside the document
   const token: string = doc?.jwt

   return new Promise(async (resolve, reject) => {
      if (token) {
         jwtValidation(token)
            .then(async () => {
               resolve(token) //if the token is still valid return it
            })
            .catch(async (error) => {
               await docRef.set({ jwt: '' }) //clear the firestore jwt and make the user sign in again
               reject(error);
            })
      } else resolve(await refreshSession(docRef, uid)) //if the document is empty refresh the session
   })
}

export const refreshSession = async (docRef: DocumentReference, uid: string): Promise<string> => {
   const jwt: string = await newSessionJWT(uid) //generate a new session token

   await docRef.set({ jwt }) //refresh the token in the session token:
   return jwt
}

export const checkIfDocumentExists = (uid: string): Promise<null> => {
   return new Promise((resolve, reject) => {
      const docRef: DocumentReference = db.collection('users').doc(uid)

      docRef.get().then((doc: DocumentData) => {
         if (doc.exists)
            resolve(null)
         else reject(err('auth/user-not-signed-up')) //if the document doesn't exists in firestore
      }).catch(() => { reject(err('auth/user-not-signed-up')) }) //if the document doesn't exists in firestore
   })
}

export const createUserDocument = (uid: string, username: string, pfp: string, bday: number): Promise<UserInfo> => {
   return new Promise(async (resolve, reject) => {
      const docRef: DocumentReference = db.collection('users').doc(uid)
      const name: string = username.substring(1) //remove the "@" from the username

      if (!(await docRef.get()).exists) { //check if the user is already registered to prevent rewrites
         try {
            pfp = pfp ? pfp : await randomProfilePicture() //set the pfp url to the one sent from the client, or if is null, select a random one

            await docRef.set({ //set the user data into the doc
               username: username,
               name: name,
               pfp: pfp,
               bday: bday
            })

            const user: UserInfo = { username, name, pfp }
            resolve(user)
         } catch (error) { reject(error) }
      } else reject(err('auth/user-already-exists'))
   })
}

export const createUserNode = (uid: string, interests: string[]): Promise<null> => {
   return new Promise(async (resolve) => {
      const neo4j: Session = neoStart()
      const query = `MERGE (:User {name:'${uid}', interests:'${interests}'})` //create a new node in neo4j
      await neo4j.executeWrite(tx => tx.run(query))
      resolve(null)
   })
}
