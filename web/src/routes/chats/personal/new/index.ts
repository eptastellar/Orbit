import { Request, Response } from "express"
import { AuthService, CoreService } from "services"
import { IdResponse, NewPersonalChatRequest } from "types"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const receiver_username: string = req.body.receiver_username

   const ereq: NewPersonalChatRequest = {
      receiver_username
   }

   core.newPersonalChat(uid, ereq.receiver_username).then((idResponse: IdResponse) => {
      core.sendNotification(["a", "b"]).then(() => { //TODO
         res.status(201).json({
            ...idResponse //return the chat id
         })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(500).json({ error: error.message }) })
}]
