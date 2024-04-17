import { Request, Response } from "express"
import { AuthService, ContentService, ValidationService } from "services"
import { ContentFetch, RootCommentsRequest } from "types"

const auth = new AuthService()
const cont = new ContentService()
const valid = new ValidationService()

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const post_id: string = req.params.id
   const last_root_comment_id: string = req.body.last_root_comment_id

   const ereq: RootCommentsRequest = {
      post_id,
      last_root_comment_id
   }

   try {
      if (ereq.last_root_comment_id) await valid.commentRootIdValidation(ereq.last_root_comment_id, ereq.post_id)

      valid.postIdValidation(ereq.post_id).then(() => {
         cont.fetchRootComments(ereq.post_id, ereq.last_root_comment_id).then((contentFetch: ContentFetch) => {
            res.status(200).json({
               ...contentFetch
            })
         }).catch((error) => { res.status(404).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   } catch (error: any) { res.status(400).json({ error: error.message }) }
}]
