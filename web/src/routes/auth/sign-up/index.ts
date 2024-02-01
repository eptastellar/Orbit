import { checkIfAccessTokenIsValid, createDoc, createNewSession, createNode } from '@contexts/AuthContext'
import { areValidInterests, isValidBday, isValidImage, isValidSignUpUsername } from '@contexts/ValidationContext'
import { Handler, Request, Response } from 'express'

export const POST: Handler = (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization!
   const username: string = req.body.username
   const interests: string[] = req.body.interests
   const bday: number = req.body.bday
   const pfp: string = req.body.pfp

   Promise.all([ //validate all user data
      isValidSignUpUsername(username),
      isValidBday(bday),
      areValidInterests(interests),
      isValidImage(pfp)
   ])
      .then(() => {
         checkIfAccessTokenIsValid(authorization).then((uid: string) => { //check if firebase access token is valid
            Promise.all([
               createDoc(uid, username, pfp, bday), //create a new doc in /users
               createNode(uid, interests) //create a new node in neo4j
            ])
               .then(() => {
                  createNewSession(uid).then((jwt: string) => { //return the session jwt and the username of the user for the frontend side
                     res.status(201).json({ success: true, jwt: jwt, username: username, pfp: pfp }) //TODO: fix and return the new created pfp
                  })
               }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(401).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}
