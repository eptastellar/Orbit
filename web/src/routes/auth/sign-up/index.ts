import { checkIfAccessTokenIsValid, createNewSession, createUserDocument, createUserNode } from '@contexts/AuthContext'
import { birthdateValidation, interestsValidation, mediaValidation, usernameValidation } from '@contexts/ValidationContext'
import { UserInfo } from '@local-types/index'
import { Request, Response } from 'express'

export const POST = (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization!
   const username: string = req.body.username
   const interests: string[] = req.body.interests
   const bday: number = req.body.bday
   const pfp: string = req.body.pfp

   checkIfAccessTokenIsValid(authorization).then((uid: string) => { //check if firebase access token is valid
      usernameValidation(username).then(() => {
         birthdateValidation(bday).then(() => {
            interestsValidation(interests).then(async () => {
               try {
                  if (pfp) await mediaValidation(pfp)
                  createUserDocument(uid, username, pfp, bday).then((user: UserInfo) => { //create a new doc in /users
                     createUserNode(uid, interests).then(() => { //create a new node in neo4j
                        createNewSession(uid).then((jwt: string) => { //return the session jwt and the user for the frontend side
                           res.status(201).json({ success: true, jwt: jwt, username: user.username, name: user.name, pfp: user.pfp })
                        }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
                     }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
                  }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
               } catch (error: any) { res.status(400).json({ success: false, message: error.message }) }
            }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(401).json({ success: false, message: error.message }) })
}
