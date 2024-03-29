import { checkIfAccessTokenIsValid, checkIfDocumentExists, createNewSession } from "@contexts/AuthContext"
import { getUserDatafromUID } from "@contexts/UserContext"
import { UserInfo } from "@local-types/index"
import { Request, Response } from "express"

export const GET = (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization!

   checkIfAccessTokenIsValid(authorization).then(async (uid: string) => { //send the firebase access token to create a session
      checkIfDocumentExists(uid).then(() => { //check if the user is fully signed up even in firestore
         createNewSession(uid).then((jwt: string) => { //create a multiaccess session using jwt
            getUserDatafromUID(uid).then((user: UserInfo) => {
               res.status(202).json({ success: true, jwt: jwt, username: user.username, name: user.name, pfp: user.pfp })
            }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(401).json({ success: false, message: error.message }) })
}
