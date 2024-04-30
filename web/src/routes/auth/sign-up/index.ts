import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { AuthResponse, SignUpRequest, UserSchema } from "types"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()
const valid: ValidationService = new ValidationService()

export const POST = (req: Request, res: Response) => {
   try {
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

      auth.accessGuard(ereq.authorization).then(async (uid: string) => { //check if firebase access token is valid
         await valid.usernameValidation(ereq.username)
         await valid.birthdateValidation(ereq.bday)
         await valid.interestsValidation(ereq.interests)
         core.newUserDocument(uid, ereq.username, ereq.bday, ereq?.pfp).then(async (userSchema: UserSchema) => { //create a new doc in /users
            await core.newUserNode(uid, ereq.interests) //create a new node in neo4j
            auth.newSession(uid).then((jwt: string) => { //return the session jwt and the user for the frontend side
               const authResponse: AuthResponse = {
                  jwt,
                  user_data: { ...userSchema }
               }

               res.status(201).json({
                  ...authResponse
               })
            })
         })
      })
   } catch (error) { resError(res, error) }
}
