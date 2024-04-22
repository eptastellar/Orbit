import { Request, Response } from "express"
import { AuthService, NotificationsService, ValidationService } from "services"
import { IdResponse, MessageRequest } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const noti = new NotificationsService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const chat_id: string = req.body.chat_id
   const text: string = req.body.text
   const type: string = req.body.type
   const content: string = req.body.content

   const ereq: MessageRequest = {
      chat_id,
      text,
      content,
      type
   }

   valid.contentValidation(ereq.text, ereq.content, ereq.type).then(() => {
      valid.chatIdValidation(chat_id).then(() => {
         noti.uploadMessage(uid, ereq.chat_id, ereq.text, ereq.type, ereq.content).then((idResponse: IdResponse) => {
            noti.sendNotification(["a", "b"]).then(() => { //TODO
               res.status(201).json({
                  ...idResponse //return the post id
               })
            }).catch((error) => { res.status(500).json({ error: error.message }) })
         }).catch((error) => { res.status(500).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]