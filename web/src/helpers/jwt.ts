import admin from 'firebase-admin'
import { DocumentData, DocumentReference, Firestore } from 'firebase-admin/firestore'
import { JWTPayload, SignJWT, jwtVerify } from 'jose'

export async function generateJWT(uid: string) {
   const payload = { 'uid': uid }

   const jwt = new SignJWT(payload)
   jwt.setProtectedHeader({ alg: 'HS256' })
   jwt.setIssuedAt()
   jwt.setExpirationTime('4w') //create a jwt and set the expire time to 4 weeks

   const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
   const signedJwt = await jwt.sign(secret)

   return signedJwt
}

export async function validateJWT(token: string): Promise<JWTPayload> { //need to use the then catch to invoke this function
   return new Promise(async (resolve, reject) => {
      try {
         const jwt: string = token.split('Bearer ')[1]
         const secret: Uint8Array = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
         const { payload } = await jwtVerify(jwt, secret) //validate the user token and return the user payload

         if (payload.exp! < Date.now() / 1000) //check if the token is expired
            reject(new Error('auth/expired-token'))

         resolve(payload) //return the token payload
      } catch (error) { reject(new Error('auth/invalid-token')) }
   })
}

export async function createNewSession(uid: string): Promise<string> {
   const db: Firestore = admin.firestore()

   const docRef: DocumentReference = db.collection('sessions').doc(uid) //create a new doc in the collection /sessions
   const doc: DocumentData = (await docRef.get()).data()! //get data inside the document
   const token: string = doc?.token

   return new Promise(async (resolve, _) => {
      if (token) {
         validateJWT(token).then(async (decodedToken: JWTPayload) => { //decode the token
            const expTime: number = decodedToken.exp! * 1000

            if (Date.now() > expTime) //check if the token is expired
               resolve(await refreshSession(docRef, uid)) //if is expired create a new session token
            else
               resolve(token) //if the token is still valid return it
         })
      } else resolve(await refreshSession(docRef, uid)) //if the document is empty refresh the session
   })
}

async function refreshSession(docRef: DocumentReference, uid: string): Promise<string> {
   const jwt: string = await generateJWT(uid) //generate a new session token

   await docRef.set({ jwt }) //refresh the token in the session token:
   return jwt
}
