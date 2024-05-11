import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { ContentFetch, RootCommentsRequest } from "types"

const auth = new AuthService()
const core = new CoreService()
const valid = new ValidationService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const post_id: string = req.params.id
      const last_root_comment_id: string = req.body.last_root_comment_id

      const ereq: RootCommentsRequest = {
         last_root_comment_id
      }

      if (ereq.last_root_comment_id)
         await valid.commentRootIdValidation(ereq.last_root_comment_id, post_id)

      await valid.documentIdValidation(post_id, "posts")
      core.fetchRootComments(post_id, ereq.last_root_comment_id).then((contentFetch: ContentFetch) => {
         res.status(200).json({
            ...contentFetch
         })
      })
   } catch (error) { resError(res, error) }
}]
