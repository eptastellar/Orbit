import { Request, Response } from "express"
import { AuthService, ContentService, ValidationService } from "services"

const auth = new AuthService()
const valid = new ValidationService()
const cont = new ContentService()

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const text: string = req.body.text
   const type: string = req.body.type
   const content: string = req.body.content

   valid.contentValidation(text, content, type).then(() => {
      cont.uploadPost(uid, text, type, content).then((postId: string) => {
         res.status(201).json({ success: true, post: postId }) //return the post id
      }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]
