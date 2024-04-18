import { Request, Response } from "express"
import { AuthService, UserService } from "services"
import { AuthResponse, UserSchema } from "types"

const auth = new AuthService()
const user = new UserService()

export const GET = (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization!

   auth.checkIfAccessTokenIsValid(authorization).then(async (uid: string) => { //send the firebase access token to create a session
      auth.checkIfDocumentExists(uid).then(() => { //check if the user is fully signed up even in firestore
         auth.createNewSession(uid).then((jwt: string) => { //create a multiaccess session using jwt
            user.getUserDatafromUID(uid).then((userSchema: UserSchema) => {
               const authResponse: AuthResponse = {
                  user_data: { ...userSchema },
                  jwt,
               }

               res.status(202).json({
                  ...authResponse
               })
            }).catch((error) => { res.status(400).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   }).catch((error) => { res.status(401).json({ error: error.message }) })
}
