import { firebase } from '@config/firebase-admin.config'
import express, { NextFunction } from 'express'
import admin from 'firebase-admin'
import { DocumentReference, DocumentSnapshot, Firestore } from 'firebase-admin/firestore'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
import { JWTPayload } from 'jose'
import { validateJWT } from './jwt'

export const checkIfSessionTokenIsValid = async (req: express.Request, res: express.Response, next: NextFunction) => {
   const authorization: string = req.headers.authorization!

   validateJWT(authorization).then((payload: JWTPayload) => { //validate if the token is signed
      firebase()
      const uid: string = payload.uid as string
      const db: Firestore = admin.firestore()

      const docRef: DocumentReference = db.collection('sessions').doc(uid)
      const jwt: string = authorization.split('Bearer ')[1]

      docRef.get().then(async (snapshot: DocumentSnapshot) => {
         if (jwt == snapshot.data()?.token) { //check if the token is the same saved in firestore
            res.locals.uid = uid //save the uid of the user to manipulate only his data
            next()
         } else throw new Error('auth/invalid-token')
      }).catch((error: Error) => { res.json({ success: false, status: 400, message: error.message }) })
   }).catch((error) => { res.json({ success: false, status: 400, message: error.message }) })
}

export async function checkIfAccessTokenIsValid(authorization: string): Promise<string> {
   return new Promise(async (resolve, reject) => {
      try {
         firebase()
         const jwt: string = authorization.split('Bearer ')[1] //remove bearer from the authentication param
         const decodedjwt: DecodedIdToken = await admin.auth().verifyIdToken(jwt) //verify token using firebase, it also check if the token is expired

         if (decodedjwt.email_verified) { //check if the email is verified
            const uid: string = decodedjwt.uid
            resolve(uid) //return the uid of the user
         } else reject(new Error('auth/email-unverified'))
      } catch (error) { reject(new Error('auth/invalid-token')) }
   })
}

export const checkIfcronSecretIsValid = async (req: express.Request, res: express.Response, next: NextFunction) => {
   next() //TODO
}
