import { Request, Response } from "express"
import { AuthService, ContentService, UserService, ValidationService } from "services"
import { ChatRequest, IdResponse } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const cont = new ContentService()
const user = new UserService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const members: string[] = req.body.members
   const name: string = req.body.name

   const ereq: ChatRequest = {
      members,
      name
   }

   valid.membersValidation(uid, members).then(() => {
      cont.newChat(uid, ereq.members, ereq.name).then((idResponse: IdResponse) => {
         user.sendNotification(["a", "b"]).then(() => { //TODO
            res.status(201).json({
               ...idResponse //return the chat id
            })
         }).catch((error) => { res.status(500).json({ error: error.message }) })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
