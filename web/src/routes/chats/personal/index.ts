import { Request, Response } from "express"
import { AuthService, NotificationsService } from "services"
import { ChatsResponse } from "types"

const auth = new AuthService()
const noti = new NotificationsService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid

   noti.getChats(uid).then((chatsResponse: ChatsResponse) => {
      res.status(200).json({
         ...chatsResponse //return the chats
      })
   }).catch((error) => { res.status(500).json({ error: error.message }) })
}]
