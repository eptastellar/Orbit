import { Request, Response } from "express"
import { AuthService, NotificationsService, ValidationService } from "services"
import { GroupChatInfoResponse } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const noti = new NotificationsService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const groupId: string = req.params.id

   valid.groupIdValidation(groupId).then(() => {
      noti.getGroupChatInfo(uid, groupId).then((groupChatInfoResponse: GroupChatInfoResponse) => {
         noti.openedMessages(uid, groupId).then(() => {
            res.status(200).json({
               ...groupChatInfoResponse //return the chat
            })
         }).catch((error) => { res.status(500).json({ error: error.message }) })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
