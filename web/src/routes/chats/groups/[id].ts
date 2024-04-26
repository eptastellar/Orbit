import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { GroupChatInfoResponse } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const groupId: string = req.params.id

   valid.documentIdValidation(groupId, "groups").then(() => {
      core.getGroupChatInfo(uid, groupId).then((groupChatInfoResponse: GroupChatInfoResponse) => {
         core.groupOpenedMessages(uid, groupId).then(() => {
            res.status(200).json({
               ...groupChatInfoResponse //return the chat
            })
         }).catch((error) => { res.status(500).json({ error: error.message }) })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
