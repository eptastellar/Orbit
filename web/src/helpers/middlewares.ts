import { baas } from "@config/firebase-admin.config";
import admin from 'firebase-admin';

export async function checkIfSessionTokenIsValid() {
   //TODO CHECK JWT in the sessions and if the token is expired, if yes resend to the login page
}

export async function checkIfAccessTokenIsValid(authorization: string): Promise<string> {
   return new Promise(async (resolve, reject) => {
      try {
         baas()
         const jwt = authorization.split("Bearer ")[1]
         const decodedjwt = await admin.auth().verifyIdToken(jwt) //verify token using firebase, it also check if the token is expired
         const uid: string = decodedjwt.uid
         resolve(uid)
      } catch (error) {
         reject(new Error('Invalid token'))
      }
   })
}
