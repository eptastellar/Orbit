import { resError } from "config"
import { randomBytes } from "crypto"
import { Request, Response } from "express"
import { AuthService, CoreService } from "services"
import { UserSchema } from "types"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (_: Request, res: Response) => {
   try {
      const randomCode: string = randomBytes(16).toString("hex")
      core.setRandomFriendCode(res.locals.uid, randomCode).then((expireTime: number) => {
         res.status(200).json({ //TODO serve un tipo
            expireTime
         })
      })
   } catch (error) { resError(res, error) }
}]

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid
      const randomCode: string = req.body.friendCode

      core.findRandomFriendCode(uid, randomCode).then((userSchema: UserSchema) => { // Returns null if the connection is not created
         res.status(200).json({
            ...userSchema
         })
      })
   } catch (error) { resError(res, error) }
}]
