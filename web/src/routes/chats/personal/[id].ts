import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { PersonalChatInfoResponse } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid
      const chatId: string = req.params.id

      await valid.documentIdValidation(chatId, "personal-chats")
      core.getPersonalChatInfo(uid, chatId).then((personalChatInfoResponse: PersonalChatInfoResponse) => {
         res.status(200).json({
            ...personalChatInfoResponse //return the chat
         })
      })
   } catch (error) { resError(res, error) }
}]
