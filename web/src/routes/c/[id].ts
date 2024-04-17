import { Request, Response } from "express"
import { AuthService, ContentService, UserService, ValidationService } from "services"
import { CommentUploadRequest, CommentUploadResponse, DeleteCommentRequest, SuccessResponse } from "types"

const auth = new AuthService()
const cont = new ContentService()
const user = new UserService()
const valid = new ValidationService()

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const post_id: string = req.params.id
   const root_id: string = req.body.root_id
   const content: string = req.body.content

   const ereq: CommentUploadRequest = {
      root_id,
      content
   }

   try {
      if (ereq.root_id) await valid.commentRootIdValidation(ereq.root_id, post_id)

      valid.postIdValidation(post_id).then(() => {
         valid.contentValidation(ereq.content).then(() => {
            cont.uploadComment(uid, ereq.root_id, post_id, ereq.content!).then((commentUploadResponse: CommentUploadResponse) => {
               res.status(201).json({
                  ...commentUploadResponse
               })
            }).catch((error) => { res.status(500).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   } catch (error: any) { res.status(400).json({ error: error.message }) }
}]

export const DELETE = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const post_id: string = req.params.id
   const comment_id: string = req.body.comment_id
   const root_id: boolean | string = req.body.root_id

   const ereq: DeleteCommentRequest = {
      comment_id,
      root_id
   }

   valid.postIdValidation(post_id).then(async () => {
      try {
         if (ereq.root_id)
            await valid.commentRootIdValidation(ereq.comment_id, post_id)
         else
            await valid.commentLeafIdValidation(ereq.comment_id, ereq.root_id as string, post_id)

         user.hasPermission(uid, ereq.comment_id, "comments").then(() => {
            cont.deleteComment(ereq.comment_id).then((success: SuccessResponse) => {
               res.status(200).json({
                  ...success
               })
            }).catch((error) => { res.status(400).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      } catch (error: any) { res.status(400).json({ error: error.message }) }
   })
}]
