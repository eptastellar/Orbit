import { baas } from "@config/firebase-admin.config";
import express, { NextFunction } from "express";
import admin from 'firebase-admin';
import { validateJWT } from "./jwt";

export const checkIfSessionTokenIsValid = async (req: express.Request, res: express.Response, next: NextFunction) => {
   const authorization = req.headers.authorization
   const jwt = authorization?.split("Bearer ")[1]

   if (jwt) {
      validateJWT(jwt).then((payload) => { //validate if the token is signed
         baas()

         const uid: string = payload.uid as string
         const db = admin.firestore()

         const docRef = db.collection('sessions').doc(uid);

         docRef.get()
            .then(async (snapshot) => {
               if (jwt == snapshot.data()?.token) { //check if the token is the same saved in firestore
                  res.locals.uid = uid //save the uid of the user to manipulate only his data
                  next()
               } else
                  throw new Error('Invalid token')
            })
            .catch((error) => {
               res.json({ success: false, message: error.message }).status(400) //redirect to the login page in the frontend
            })
      }).catch((error) => {
         res.json({ success: false, message: error.message }).status(400)
      })
   } else
      res.json({ success: false, message: 'Invalid token' }).status(400)
}

export async function checkIfAccessTokenIsValid(authorization: string): Promise<string> {
   return new Promise(async (resolve, reject) => {
      try {
         baas()
         const jwt = authorization.split("Bearer ")[1] //remove bearer from the authentication param
         const decodedjwt = await admin.auth().verifyIdToken(jwt) //verify token using firebase, it also check if the token is expired
         const uid: string = decodedjwt.uid
         resolve(uid) //return the uid of the user
      } catch (error) {
         reject(new Error('Invalid token'))
      }
   })
}

export const cronSecretIsValid = async (req: express.Request, res: express.Response, next: NextFunction) => {
   next() //TODO
}
