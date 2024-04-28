import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { AuthResponse, SignUpRequest, UserSchema } from "types"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()
const valid: ValidationService = new ValidationService()

export const POST = (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization!
   const username: string = req.body.username
   const interests: string[] = req.body.interests
   const bday: number = req.body.bday
   const pfp: string = req.body.pfp

   const ereq: SignUpRequest = {
      authorization,
      username,
      interests,
      bday,
      pfp
   }

   auth.accessGuard(ereq.authorization).then((uid: string) => { //check if firebase access token is valid
      valid.usernameValidation(ereq.username).then(() => {
         valid.birthdateValidation(ereq.bday).then(() => {
            valid.interestsValidation(ereq.interests).then(async () => {
               core.newUserDocument(uid, ereq.username, ereq.bday, ereq?.pfp).then((userSchema: UserSchema) => { //create a new doc in /users
                  core.newUserNode(uid, ereq.interests).then(() => { //create a new node in neo4j
                     auth.newSession(uid).then((jwt: string) => { //return the session jwt and the user for the frontend side
                        const authResponse: AuthResponse = {
                           jwt,
                           user_data: { ...userSchema }
                        }

                        res.status(201).json({
                           ...authResponse
                        })
                     }).catch((error: Error) => { res.status(500).json({ error: error.message }) })
                  }).catch((error: Error) => { res.status(500).json({ error: error.message }) })
               }).catch((error: Error) => { res.status(500).json({ error: error.message }) })
            }).catch((error: Error) => { res.status(400).json({ error: error.message }) })
         }).catch((error: Error) => { res.status(400).json({ error: error.message }) })
      }).catch((error: Error) => { res.status(400).json({ error: error.message }) })
   }).catch((error: Error) => { res.status(401).json({ error: error.message }) })
}
