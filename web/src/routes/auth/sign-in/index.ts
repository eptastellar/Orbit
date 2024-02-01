import { checkIfAccessTokenIsValid, checkIfDocumentExists, createNewSession } from '@contexts/AuthContext'
import { retrieveUserDataFromUID } from '@contexts/UserContext'
import { Handler, Request, Response } from 'express'

export const GET: Handler = (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization!

   checkIfAccessTokenIsValid(authorization).then(async (uid: string) => { //send the firebase access token to create a session
      checkIfDocumentExists(uid).then(() => { //check if the user is fully signed up even in firestore
         createNewSession(uid).then((jwt: string) => { //create a multiaccess session using jwt
            retrieveUserDataFromUID(uid).then((promise) => {
               res.status(202).json({ success: true, jwt: jwt, username: promise.username, pfp: promise.pfp }) //return the session jwt and the username of the user for the frontend side
            }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(401).json({ success: false, message: error.message }) })
}
