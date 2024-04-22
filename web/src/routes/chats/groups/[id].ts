// import { Request, Response } from "express"
// import { AuthService, ContentService, ValidationService } from "services"

// const auth = new AuthService()
// const valid = new ValidationService()
// const cont = new ContentService()

// export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
//    const uid: string = res.locals.uid
//    const chat_id: string = req.params.id

//    valid.chatIdValidation(chat_id).then(() => {
//       cont.getChats(uid).then((chatsResponse: ChatsResponse) => {
//          res.status(200).json({
//             ...chatsResponse //return the chats
//          })
//       }).catch((error) => { res.status(500).json({ error: error.message }) })
//    }).catch((error) => { res.status(400).json({ error: error.message }) })
// }]
