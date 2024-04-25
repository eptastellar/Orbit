import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { PersonalChatInfoResponse } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const chatId: string = req.params.id

   valid.documentIdValidation(chatId, "personal-chats").then(() => {
      core.getPersonalChatInfo(uid, chatId).then((personalChatInfoResponse: PersonalChatInfoResponse) => {
         core.openedMessages(uid, chatId).then(() => {
            res.status(200).json({
               ...personalChatInfoResponse //return the chat
            })
         }).catch((error) => { res.status(500).json({ error: error.message }) })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
