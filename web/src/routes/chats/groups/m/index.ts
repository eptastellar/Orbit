import { Request, Response } from "express"
import { AuthService, NotificationsService, ValidationService } from "services"
import { ContentFetch, MessagesRequest } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const noti = new NotificationsService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const chat_id: string = req.body.group_id
   const last_message_id: string = req.body.last_message_id

   const ereq: MessagesRequest = {
      chat_id,
      last_message_id
   }

   try {
      if (ereq.last_message_id) await valid.documentIdValidation(ereq.last_message_id, "messages")
      
      valid.documentIdValidation(ereq.chat_id, "groups").then(() => {
         noti.getChatMessages(uid, ereq.chat_id, ereq.last_message_id).then((contentFetch: ContentFetch) => {
            res.status(200).json({
               ...contentFetch
            })
         }).catch((error) => { res.status(200).json({ error: error.message }) })
      }).catch((error) => { res.status(200).json({ error: error.message }) })
   } catch (error: any) { res.status(400).json({ error: error.message }) }
}]
