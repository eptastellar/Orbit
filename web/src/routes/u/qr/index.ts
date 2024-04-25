import { randomBytes } from "crypto"
import { Request, Response } from "express"
import { AuthService, CoreService } from "services"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (_: Request, res: Response) => {
   const randomCode: string = randomBytes(16).toString("hex")
   const expireTime = await core.setRandomFriendCode(res.locals.uid, randomCode)

   res.status(200).json({ success: true, message: randomCode, expireTime })
}]

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const randomCode: string = req.body.friendCode

   const friendName: string | null = await core.findRandomFriendCode(uid, randomCode) // Returns null if the connection is not created

   if (friendName === null)
      res.status(408).json({ error: "Request Time Out" }) //TODO change error type
   else res.status(200).json({ success: true, name: friendName }) //TODO add the firebase id to send the message
}]
