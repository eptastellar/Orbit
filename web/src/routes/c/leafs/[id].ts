import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { ContentFetch, LeafCommentsRequest } from "types"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()
const valid: ValidationService = new ValidationService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const root_id: string = req.params.id
      const last_leaf_comment_id: string = req.body.last_leaf_comment_id
      const post_id: string = req.body.post_id

      const ereq: LeafCommentsRequest = {
         last_leaf_comment_id,
         post_id
      }

      if (ereq.last_leaf_comment_id)
         await valid.commentLeafIdValidation(ereq.last_leaf_comment_id, root_id, ereq.post_id)

      await valid.documentIdValidation(ereq.post_id, "posts")
      await valid.commentRootIdValidation(root_id, ereq.post_id)
      core.fetchLeafsComments(root_id, ereq.last_leaf_comment_id).then((contentFetch: ContentFetch) => {
         res.status(200).json({
            ...contentFetch
         })
      })
   } catch (error) { resError(res, error) }
}]
