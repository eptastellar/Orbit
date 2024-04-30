import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService } from "services"
import { IdResponse, NewPersonalChatRequest } from "types"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid
      const receiver_username: string = req.body.receiver_username

      const ereq: NewPersonalChatRequest = {
         receiver_username
      }

      //TODO members validation
      core.getUidFromUserData(ereq.receiver_username).then((receiverUid: string) => {
         core.newPersonalChat(uid, receiverUid).then(async (idResponse: IdResponse) => {
            res.status(201).json({
               ...idResponse //return the chat id
            })
         })
      })
   } catch (error) { resError(res, error) }
}]
