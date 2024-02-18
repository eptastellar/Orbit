import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { uploadPost } from "@contexts/ContentContext"
import { contentValidation } from "@contexts/ValidationContext"
import { Request, Response } from "express"

export const POST = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const text: string = req.body.text
   const type: string = req.body.type
   const content: string = req.body.content

   contentValidation(text, content, type).then(() => {
      uploadPost(uid, text, type, content).then((postId: string) => {
         res.status(201).json({ success: true, post: postId }) //return the post id
      }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]
