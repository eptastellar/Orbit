import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { ContentFetch, MessagesRequest } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid
      const chat_id: string = req.body.group_id
      const last_message_id: string = req.body.last_message_id

      const ereq: MessagesRequest = {
         chat_id,
         last_message_id
      }

      if (ereq.last_message_id)
         await valid.documentIdValidation(ereq.last_message_id, "messages")

      await valid.documentIdValidation(ereq.chat_id, "groups")
      core.fetchChatMessages(uid, ereq.chat_id, true, ereq.last_message_id).then((contentFetch: ContentFetch) => {
         res.status(200).json({
            ...contentFetch
         })
      })
   } catch (error) { resError(res, error) }
}]
