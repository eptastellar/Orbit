import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService } from "services"
import { ChatsResponse } from "types"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid

      core.getGroupChats(uid).then((chatsResponse: ChatsResponse) => {
         res.status(200).json({
            ...chatsResponse //return the chats
         })
      })
   } catch (error) { resError(res, error) }
}]
