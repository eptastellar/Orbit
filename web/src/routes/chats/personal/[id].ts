import { Request, Response } from "express"
import { AuthService, NotificationsService, ValidationService } from "services"
import { ChatSchema } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const noti = new NotificationsService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const chat_id: string = req.params.id

   valid.chatIdValidation(chat_id).then(() => {
      noti.getChat(uid, chat_id).then((chatSchema: ChatSchema) => {
         res.status(200).json({
            ...chatSchema //return the chat
         })
      })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
