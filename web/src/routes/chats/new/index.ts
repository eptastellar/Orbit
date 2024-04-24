import { Request, Response } from "express"
import { AuthService, NotificationsService, ValidationService } from "services"
import { IdResponse, NewChatRequest } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const noti = new NotificationsService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const members: string[] = req.body.members
   const name: string = req.body.name
   const pfp: string = req.body.pfp

   const ereq: NewChatRequest = {
      members,
      name,
      pfp
   }

   valid.membersValidation(uid, members).then(() => {
      noti.newChat(uid, ereq.members, ereq.name, ereq.pfp).then((idResponse: IdResponse) => {
         noti.sendNotification(["a", "b"]).then(() => { //TODO
            res.status(201).json({
               ...idResponse //return the chat id
            })
         }).catch((error) => { res.status(500).json({ error: error.message }) })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
