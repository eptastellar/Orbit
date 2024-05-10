import { err, firebase, neo, resError } from "config"
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

      this.jwtVerification(token).then(async (payload: JWTPayload) => { //validate if the token is signed
         const uid: string = payload.uid as string

         const docRef: DocumentReference = this.db.collection("sessions").doc(uid)
         const jwt: string = authorization.split("Bearer ")[1]

         const snapshot: DocumentSnapshot = await docRef.get()
         const data: DocumentData = snapshot.data()!

         if (jwt === data.jwt) { //check if the token is the same saved in firestore
            res.locals.uid = uid //save the uid of the user to manipulate only his data
            next()
         } else throw err("auth/invalid-token")
      }).catch((error: Error) => { resError(res, error) })
   }

   public accessGuard = async (authorization: string): Promise<string> => {
      return new Promise(async (resolve, reject) => {
         try {
            const jwt: string = authorization.split("Bearer ")[1] //remove bearer from the authentication param
            const decodedjwt: DecodedIdToken = await admin.auth().verifyIdToken(jwt) //verify token using firebase, it also check if the token is expired

            if (decodedjwt.email_verified) { //check if the email is verified
               const uid: string = decodedjwt.uid
               return resolve(uid) //return the uid of the user
            } else return reject(err("auth/email-unverified"))
         } catch { return reject(err("auth/invalid-token")) }
      })
   }

   public cronGuard = async (req: express.Request, res: express.Response, next: NextFunction) => {
      try {
         const authorization: string = req.headers.authorization!
         const secret: string = authorization.split("Bearer ")[1]

         if (secret === process.env.CRON_SECRET)
            next()
         else throw err("auth/invalid-token")
      } catch (error) { resError(res, error) }
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

   public jwtVerification = (token: string): Promise<JWTPayload> => {
      return new Promise(async (resolve, reject) => {
         try {
            const secret: Uint8Array = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
            const { payload } = await jwtVerify(token, secret) //validate the user token and return the user payload

            if (payload.exp! < (Date.now() / 1000)) //check if the token is expired
               return reject(err("auth/expired-token"))

            return resolve(payload) //return the token payload
         } catch { return reject(err("auth/invalid-token")) }
      })
   }

   public newSession = async (uid: string): Promise<string> => {
      return new Promise(async (resolve, reject) => {
         const docRef: DocumentReference = this.db.collection("sessions").doc(uid) //create a new doc in the collection /sessions
         const doc: DocumentData = await docRef.get()
         const data: DocumentData = await doc.data()
         const token: string = data?.jwt

         if (token) {
            this.jwtVerification(token).then(() => {
               return resolve(token) //if the token is still valid return it
            }).catch(async (error) => {
               await docRef.set({ jwt: "" }) //clear the firestore jwt and make the user sign in again
               return reject(error)
            })
         } else return resolve(await this.refreshSession(docRef, uid)) //if the document is empty refresh the session
      })
   }

   public refreshSession = async (docRef: DocumentReference, uid: string): Promise<string> => {
      return new Promise(async (resolve) => {
         const jwt: string = await this.newSessionJWT(uid) //generate a new session token

         await docRef.set({ jwt }) //refresh the token in the session token:
         return resolve(jwt)
      })

   }

   public logOut = (uid: string): Promise<SuccessResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection("sessions").doc(uid)
            await docRef.set({ jwt: "" })

            const successResponse: SuccessResponse = {
               success: true
            }
            return resolve(successResponse)
         } catch { return reject("auth/log-out-failed") }
      })
   }

   public hasPermissionGuard = (uid: string, id: string, path: string): Promise<void> => {
      return new Promise(async (resolve, reject) => {
         try {
            const docRef: DocumentReference = this.db.collection(path).doc(id)
            const doc: DocumentData = await docRef.get()
            const data: DocumentData = await doc.data()

            if (data.owner === uid)
               return resolve()
            else return reject(err("auth/unauthorized"))
         } catch { return reject(err("auth/unauthorized")) }
      })
   }

   public areFriendsGuard = (uid: string, friendUid: string): Promise<void> => {
      return new Promise(async (resolve, reject) => {
         if (uid !== friendUid) {
            const query: string = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) where u.name = "${uid}" AND t.name = "${friendUid}" RETURN t`
            const resultMap: QueryResult = await neo().executeRead(tx => tx.run(query))
            const check = resultMap.records.map((row: any) => row.get("t"))

            if (check[0] !== null)
               return resolve()
            else return reject(err("auth/not-friends"))
         } else return resolve()
      })
   }
}
