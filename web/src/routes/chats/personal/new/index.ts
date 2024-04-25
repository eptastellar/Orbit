import { Request, Response } from "express"
import { AuthService, NotificationsService } from "services"
import { IdResponse, NewPersonalChatRequest } from "types"

const auth = new AuthService()
const noti = new NotificationsService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const receiver_username: string = req.body.receiver_username

   const ereq: NewPersonalChatRequest = {
      receiver_username
   }

   noti.newPersonalChat(uid, ereq.receiver_username).then((idResponse: IdResponse) => {
      noti.sendNotification(["a", "b"]).then(() => { //TODO
         res.status(201).json({
            ...idResponse //return the chat id
         })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(500).json({ error: error.message }) })
}]
