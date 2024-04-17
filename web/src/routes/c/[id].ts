import { Request, Response } from "express"
import { AuthService, ContentService, UserService, ValidationService } from "services"

const auth = new AuthService()
const cont = new ContentService()
const user = new UserService()
const valid = new ValidationService()

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const postId: string = req.params.id
   const rootId: string = req.body.rootId
   const text: string = req.body.content

   try {
      if (rootId) await valid.commentRootIdValidation(rootId, postId)

      valid.postIdValidation(postId).then(() => {
         valid.contentValidation(text).then(() => {
            cont.uploadComment(uid, rootId, postId, text).then((comment: string) => {
               res.status(201).json({ success: true, comment: comment })
            }).catch((error) => { res.status(500).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   } catch (error: any) { res.status(400).json({ error: error.message }) }
}]

export const DELETE = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const commentId: string = req.body.commentId
   const postId: string = req.params.id
   const rootId: boolean | string = req.body.rootId

   valid.postIdValidation(postId).then(async () => {
      try {
         if (rootId)
            await valid.commentRootIdValidation(commentId, postId)
         else
            await valid.commentLeafIdValidation(commentId, rootId as string, postId)

         user.hasPermission(uid, commentId, "comments").then(() => {
            cont.deleteComment(commentId).then(() => {
               res.status(200).json({ success: true })
            }).catch((error) => { res.status(400).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      } catch (error: any) { res.status(400).json({ error: error.message }) }
   })
}]
