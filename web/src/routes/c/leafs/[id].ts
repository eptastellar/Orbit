import { Request, Response } from "express"
import { AuthService, ContentService, ValidationService } from "services"
import { ContentFetch, LeafCommentsRequest } from "types"

const auth = new AuthService()
const cont = new ContentService()
const valid = new ValidationService()

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const root_id: string = req.params.id
   const last_leaf_comment_id: string = req.body.last_leaf_comment_id
   const post_id: string = req.body.post_id

   const ereq: LeafCommentsRequest = {
      last_leaf_comment_id,
      post_id
   }

   try {
      if (ereq.last_leaf_comment_id) await valid.commentLeafIdValidation(ereq.last_leaf_comment_id, root_id, ereq.post_id)

      valid.postIdValidation(ereq.post_id).then(async () => {
         valid.commentRootIdValidation(root_id, ereq.post_id).then(() => {
            cont.fetchLeafsComments(root_id, ereq.last_leaf_comment_id).then((contentFetch: ContentFetch) => {
               res.status(200).json({
                  ...contentFetch
               })
            }).catch((error) => { res.status(404).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   } catch (error: any) { res.status(400).json({ error: error.message }) }
}]
