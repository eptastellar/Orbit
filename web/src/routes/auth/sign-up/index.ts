import { Request, Response } from "express"
import { AuthService, ValidationService } from "services"
import { AuthResponse, UserSchema } from "types"

const auth = new AuthService()
const valid = new ValidationService()

export const POST = (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization!
   const username: string = req.body.username
   const interests: string[] = req.body.interests
   const bday: number = req.body.bday
   const pfp: string = req.body.pfp

   auth.checkIfAccessTokenIsValid(authorization).then((uid: string) => { //check if firebase access token is valid
      valid.usernameValidation(username).then(() => {
         valid.birthdateValidation(bday).then(() => {
            valid.interestsValidation(interests).then(async () => {
               try {
                  if (pfp) await valid.mediaValidation(pfp)
                  auth.createUserDocument(uid, username, pfp, bday).then((userSchema: UserSchema) => { //create a new doc in /users
                     auth.createUserNode(uid, interests).then(() => { //create a new node in neo4j
                        auth.createNewSession(uid).then((jwt: string) => { //return the session jwt and the user for the frontend side
                           const authResponse: AuthResponse = {
                              jwt,
                              ...userSchema
                           }

                           res.status(201).json({
                              success: true,
                              ...authResponse
                           })
                        }).catch((error) => { res.status(500).json({ error: error.message }) })
                     }).catch((error) => { res.status(500).json({ error: error.message }) })
                  }).catch((error) => { res.status(500).json({ error: error.message }) })
               } catch (error: any) { res.status(400).json({ error: error.message }) }
            }).catch((error) => { res.status(400).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   }).catch((error) => { res.status(401).json({ error: error.message }) })
}
