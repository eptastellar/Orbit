import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService } from "services"
import { NumberResponse } from "types"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, (_: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid
      core.getUnreadedMessagesCount(uid).then((numberResponse: NumberResponse) => {
         res.status(200).json({
            ...numberResponse
         })
      })
   } catch (error) { resError(res, error) }
}]
