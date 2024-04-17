import { Request, Response } from "express"
import { AuthService, UserService } from "services"

const auth = new AuthService()
const user = new UserService()

export const GET = [auth.checkIfSessionTokenIsValid, async (_: Request, res: Response) => {
   const randomCode: string = user.createRandomString(16) //TODO: Need changes for more combinations
   user.setRandomFriendCode(res.locals.uid, randomCode)

   res.status(200).json({ success: true, message: randomCode })
}]

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const randomCode: string = req.body.friendCode

   const friendName: string | null = await user.findRandomFriendCode(uid, randomCode) // Returns null if the connection is not created

   if (friendName === null)
      res.status(408).json({ error: "Request Time Out" }) //TODO change error type
   else res.status(200).json({ success: true, name: friendName }) //TODO add the firebase id to send the message
}]
