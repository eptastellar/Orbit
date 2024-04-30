import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { GroupChatInfoResponse } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid
      const groupId: string = req.params.id

      await valid.documentIdValidation(groupId, "groups")
      core.getGroupChatInfo(uid, groupId).then((groupChatInfoResponse: GroupChatInfoResponse) => {
         res.status(200).json({
            ...groupChatInfoResponse //return the chat
         })
      })
   } catch (error) { resError(res, error) }
}]
