import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { CommentUploadRequest, DeleteCommentRequest, IdResponse, SuccessResponse } from "types"

const auth = new AuthService()
const core = new CoreService()
const valid = new ValidationService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid
      const post_id: string = req.params.id
      const root_id: string = req.body.root_id
      const content: string = req.body.content

      const ereq: CommentUploadRequest = {
         root_id,
         content
      }

      if (ereq.root_id)
         await valid.commentRootIdValidation(ereq.root_id, post_id)

      await valid.documentIdValidation(post_id, "posts")
      await valid.contentValidation(ereq.content)
      core.newComment(uid, ereq.root_id, post_id, ereq.content).then((idResponse: IdResponse) => {
         res.status(201).json({
            ...idResponse
         })
      })
   } catch (error) { resError(res, error) }
}]

export const DELETE = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid
      const post_id: string = req.params.id
      const comment_id: string = req.body.comment_id
      const root_id: boolean | string = req.body.root_id

      const ereq: DeleteCommentRequest = {
         comment_id,
         root_id
      }

      await valid.documentIdValidation(post_id, "posts")

      if (ereq.root_id)
         await valid.commentRootIdValidation(ereq.comment_id, post_id)
      else
         await valid.commentLeafIdValidation(ereq.comment_id, ereq.root_id as string, post_id)

      await auth.hasPermissionGuard(uid, ereq.comment_id, "comments")
      core.deleteComment(ereq.comment_id).then((successResponse: SuccessResponse) => {
         res.status(200).json({
            ...successResponse
         })
      })
   } catch (error) { resError(res, error) }
}]
