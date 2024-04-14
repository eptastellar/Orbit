import { Request, Response } from "express"
import { AuthService, UserService, ValidationService } from "services"

const auth = new AuthService()
const user = new UserService()
const valid = new ValidationService()

export const GET = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {

   const randomNumber: string = user.createRandomString(16) //TODO: Need changes for more combinations
   user.setRandomFriendCode(res.locals.uid, randomNumber)

   res.status(200).json({ success: true, message: randomNumber })
}]

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {

   const uid: string = res.locals.uid
   const randomNumber: string = req.body.friendCode

   const friendName: string | null = await user.findRandomFriendCode(uid, randomNumber) // Returns null if the connection is not created

   if (friendName === null) res.status(408).json({ success: false, message: "Request Time Out" })
   else res.status(200).json({ success: true, name: friendName })
}]
