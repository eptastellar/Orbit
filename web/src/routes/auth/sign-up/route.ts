import { checkIfAccessTokenIsValid, createDoc, createNewSession, createNode } from '@contexts/AuthContext'
import { areValidInterests, isValidBday, isValidImage, isValidSignUpUsername } from '@helpers/validate'
import { Request, Response, Router } from 'express'

const app: Router = Router()

app.post('/', (req: Request, res: Response) => {
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
                     res.status(201).json({ success: true, jwt: jwt, username: username })
                  })
               }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(401).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
})

app.post('/validate', (req: Request, res: Response) => {
   const username: string = req.body.username
   const bday: number = req.body.bday

   Promise.all([
      isValidSignUpUsername(username),
      isValidBday(bday)
   ])
      .then(() => { res.status(200).json({ success: true }) })
      .catch((error) => { res.status(400).json({ success: false, message: error.message }) })
})

export default app
