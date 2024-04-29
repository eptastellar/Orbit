import { Request, Response } from "express"
import { AuthService, CoreService } from "services"
import { IdResponse, NewGroupChatRequest } from "types"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const members: string[] = req.body.members
   const name: string = req.body.name
   const pfp: string = req.body.pfp

   const ereq: NewGroupChatRequest = {
      members,
      pfp,
      name
   }
   //TODO members validation
   const membersUids: string[] = await core.getMembersUidsFromUsernames(ereq.members)
   core.newGroupChat(uid, membersUids, ereq.name, ereq.pfp).then((idResponse: IdResponse) => {
      res.status(201).json({
         ...idResponse //return the chat id
      })
   }).catch((error) => { res.status(500).json({ error: error.message }) })
}]