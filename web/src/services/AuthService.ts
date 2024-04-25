import { err, firebase, neo } from "config"
import express, { NextFunction } from "express"
import admin, { firestore } from "firebase-admin"
import { DocumentData, DocumentReference, DocumentSnapshot, Firestore } from "firebase-admin/firestore"
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier"
import { JWTPayload, SignJWT, jwtVerify } from "jose"
import { QueryResult } from "neo4j-driver"
import { SuccessResponse } from "types"

export default class AuthService {
   private db: Firestore

   constructor() {
      firebase()
      this.db = firestore()
   }

   public sessionGuard = async (req: express.Request, res: express.Response, next: NextFunction) => {
      const authorization: string = req.headers.authorization!
      const token: string = authorization.split("Bearer ")[1]

      this.jwtValidation(token).then((payload: JWTPayload) => { //validate if the token is signed
         const uid: string = payload.uid as string

         const docRef: DocumentReference = this.db.collection("sessions").doc(uid)
         const jwt: string = authorization.split("Bearer ")[1]

         docRef.get().then(async (snapshot: DocumentSnapshot) => {
            if (jwt == snapshot.data()?.jwt) { //check if the token is the same saved in firestore
               res.locals.uid = uid //save the uid of the user to manipulate only his data
               next()
            } else throw err("auth/invalid-token")
         }).catch((error: Error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(401).json({ error: error.message }) })
   }

   public accessGuard = async (authorization: string): Promise<string> => {
      return new Promise(async (resolve, reject) => {
         try {
            const jwt: string = authorization.split("Bearer ")[1] //remove bearer from the authentication param
            const decodedjwt: DecodedIdToken = await admin.auth().verifyIdToken(jwt) //verify token using firebase, it also check if the token is expired

            if (decodedjwt.email_verified) { //check if the email is verified
               const uid: string = decodedjwt.uid
               resolve(uid) //return the uid of the user
            } else reject(err("auth/email-unverified"))
         } catch { reject(err("auth/invalid-token")) }
      })
   }

   public cronGuard = async (req: express.Request, res: express.Response, next: NextFunction) => {
      try {
         const authorization: string = req.headers.authorization!
         const secret: string = authorization.split("Bearer ")[1]

         if (secret === process.env.CRON_SECRET)
            next()
         else res.status(400).json({ error: "auth/invalid-token" })
      } catch { res.status(400).json({ error: "auth/invalid-token" }) }
   }

   public newSessionJWT = async (uid: string) => {
      const payload = { "uid": uid }
      const secret: Uint8Array = new TextEncoder().encode(process.env.JWT_SECRET_KEY)

      const jwt: string = await new SignJWT(payload)
         .setProtectedHeader({ alg: "HS256" })
         .setIssuedAt()
         .setExpirationTime("4w") //create a jwt and set the expire time to 4 weeks
         .sign(secret)

      return jwt
   }

   public jwtValidation = (token: string): Promise<JWTPayload> => {
      return new Promise(async (resolve, reject) => {
         try {
            const secret: Uint8Array = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
            const { payload } = await jwtVerify(token, secret) //validate the user token and return the user payload

            if (payload.exp! < (Date.now() / 1000)) //check if the token is expired
               reject(err("auth/expired-token"))

            resolve(payload) //return the token payload
         } catch { reject(err("auth/invalid-token")) }
      })
   }

   public createNewSession = async (uid: string): Promise<string> => {
      const docRef: DocumentReference = this.db.collection("sessions").doc(uid) //create a new doc in the collection /sessions
      const doc: DocumentData = (await docRef.get()).data()! //get data inside the document
      const token: string = doc?.jwt

      return new Promise(async (resolve, reject) => {
         if (token) {
            this.jwtValidation(token)
               .then(async () => {
                  resolve(token) //if the token is still valid return it
               })
               .catch(async (error) => {
                  await docRef.set({ jwt: "" }) //clear the firestore jwt and make the user sign in again
                  reject(error)
               })
         } else resolve(await this.refreshSession(docRef, uid)) //if the document is empty refresh the session
      })
   }

   public refreshSession = async (docRef: DocumentReference, uid: string): Promise<string> => {
      const jwt: string = await this.newSessionJWT(uid) //generate a new session token

      await docRef.set({ jwt }) //refresh the token in the session token:
      return jwt
   }

   public logOut = (uid: string): Promise<SuccessResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("sessions").doc(uid)
            await docRef.set({ jwt: "" })

            const successResponse: SuccessResponse = {
               success: true
            }
            resolve(successResponse)
         } catch { reject("auth/log-out-failed") }
      })
   }

   public hasPermissionGuard = (uid: string, id: string, path: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection(path).doc(id)

            if ((await docRef.get()).data()?.owner == uid)
               resolve(null)
            else reject(err("server/unauthorized"))
         } catch { reject(err("server/unauthorized")) }
      })
   }

   public areFriendsGuard = (personalUid: string, friendUid: string): Promise<null> => {
      return new Promise(async (resolve, reject) => {
         if (personalUid != friendUid) {
            const query: string = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) where u.name = "${personalUid}" AND t.name = "${friendUid}" RETURN t`
            const resultMap: QueryResult = await neo().executeRead(tx => tx.run(query))
            const check = resultMap.records.map((row: any) => row.get("t"))

            if (check[0] !== null)
               resolve(null)
            else reject(err("server/not-friends"))
         } else resolve(null)
      })
   }
}
