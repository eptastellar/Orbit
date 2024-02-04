import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { uploadComment } from "@contexts/ContentContext"
import { commentRootIdValidation, contentValidation, postIdValidation } from "@contexts/ValidationContext"
import { Request, Response } from "express"

export const POST = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const postId: string = req.params.id
   const rootId: string = req.body.rootId
   const text: string = req.body.content

   try {
      if (rootId) await commentRootIdValidation(rootId, postId)

      postIdValidation(postId).then(() => {
         contentValidation(text).then(() => {
            uploadComment(uid, rootId, postId, text).then((comment: string) => {
               res.status(201).json({ success: true, comment: comment })
            }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   } catch (error: any) { res.status(400).json({ success: false, message: error.message }) }
}]
