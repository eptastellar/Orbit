import { Request, Response } from "express"
import { AuthService, NotificationsService, ValidationService } from "services"
import { PersonalChatInfoResponse } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const noti = new NotificationsService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const chatId: string = req.params.id

   valid.chatIdValidation(chatId).then(() => {
      noti.getPersonalChatInfo(uid, chatId).then((personalChatInfoResponse: PersonalChatInfoResponse) => {
         noti.openedMessages(uid, chatId).then(() => {
            res.status(200).json({
               ...personalChatInfoResponse //return the chat
            })
         }).catch((error) => { res.status(500).json({ error: error.message }) })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
